const { ImapFlow } = require('imapflow');
const config = require('../../config/env');
const logger = require('../../utils/logger');

const RECONNECT_DELAY_MS = 5000;
const POLL_INTERVAL_MS = 60000;

let client = null;
let reconnectTimer = null;
let pollTimer = null;
let currentCallback = null;
let connecting = false;
let fetchInFlight = false;

const scheduleReconnect = (reason, error, instance) => {
  if (reconnectTimer) {
    return;
  }

  const details = error ? `${reason}: ${error.message}` : reason;
  logger.error(`[IMAP] scheduling reconnect – ${details}`);

  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  if (!instance || instance === client) {
    client = null;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectClient();
  }, RECONNECT_DELAY_MS);
};

const onClientError = (instance, error) => {
  if (instance !== client) {
    return;
  }

  logger.error(`[IMAP] error event: ${error.message}`);

  const recoverableCodes = ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'EPIPE'];
  if (recoverableCodes.includes(error.code)) {
    scheduleReconnect('recoverable error', error, instance);
    return;
  }

  scheduleReconnect('unexpected error', error, instance);
};

const onClientClosed = (instance, reason) => {
  if (instance !== client) {
    return;
  }

  logger.info(`[IMAP] connection ${reason}; scheduling reconnect`);
  scheduleReconnect(reason, null, instance);
};

const fetchUnseen = async () => {
  const activeClient = client;

  if (!activeClient || !activeClient.authenticated) {
    return;
  }

  if (fetchInFlight) {
    return;
  }

  fetchInFlight = true;
  let lock;

  try {
    try {
      lock = await activeClient.getMailboxLock('INBOX');
    } catch (lockErr) {
      logger.error(`[IMAP] mailbox lock failed: ${lockErr.message}`);
      if (lockErr.code === 'MailboxDoesNotExistError') {
        throw lockErr;
      }
      return;
    }

    for await (const msg of activeClient.fetch({ seen: false }, { uid: true, envelope: true, source: true })) {
      try {
        const emailData = {
          subject: msg.envelope?.subject || '(no subject)',
          body: msg.source ? msg.source.toString() : '',
        };

        if (typeof currentCallback === 'function') {
          await currentCallback(emailData);
        }

        await activeClient.messageFlagsAdd(msg.uid, ['\\Seen'], { uid: true });
      } catch (processingError) {
        logger.error(`[IMAP] processing error: ${processingError.message}`);
      }
    }
  } catch (err) {
    logger.error(`[IMAP] fetch failed: ${err.message}`);
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET') {
      scheduleReconnect('fetch failure', err, activeClient);
    }
  } finally {
    if (lock) {
      try {
        lock.release();
      } catch (releaseErr) {
        logger.error(`[IMAP] mailbox lock release failed: ${releaseErr.message}`);
      }
    }
    fetchInFlight = false;
  }
};

const connectClient = async () => {
  if (connecting) {
    return;
  }

  connecting = true;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  const imapClient = new ImapFlow({
    host: config.IMAP_HOST,
    port: config.IMAP_PORT,
    secure: config.IMAP_PORT === 993,
    auth: {
      user: config.IMAP_USER,
      pass: config.IMAP_PASS,
    },
    logger: false,
    logRaw: false,
  });

  imapClient.on('error', (err) => onClientError(imapClient, err));
  imapClient.on('close', () => onClientClosed(imapClient, 'closed'));
  imapClient.on('end', () => onClientClosed(imapClient, 'ended'));
  imapClient.on('logout', () => onClientClosed(imapClient, 'logged out'));

  client = imapClient;

  try {
    await imapClient.connect();
    logger.info('[IMAP] connected');

    // cancel any existing poll loop before scheduling a new one
    if (pollTimer) {
      clearInterval(pollTimer);
    }

    pollTimer = setInterval(fetchUnseen, POLL_INTERVAL_MS);
    // Immediately trigger a fetch without waiting for the first interval tick
    fetchUnseen().catch((err) => {
      logger.error(`[IMAP] initial fetch failure: ${err.message}`);
    });
  } catch (err) {
    logger.error(`[IMAP] connect error: ${err.message}`);
    scheduleReconnect('connect error', err, imapClient);
  } finally {
    connecting = false;
  }
};

const startImapListener = (callback) => {
  if (typeof callback !== 'function') {
    throw new Error('startImapListener requires a callback function');
  }

  currentCallback = callback;

  if (client && client.authenticated) {
    logger.info('[IMAP] listener already active');
    return;
  }

  connectClient();
};

module.exports = { startImapListener };
