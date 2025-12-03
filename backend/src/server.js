const app = require('./app');
const config = require('./config/env');
const { startImapListener } = require('./api/email/email.imap');

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);

  startImapListener((email) => {
    console.log(`New email received: ${email.subject}`);
  });
});