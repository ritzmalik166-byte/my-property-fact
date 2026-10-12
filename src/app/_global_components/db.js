/**
 * Optional DB module for chatbot lead storage.
 * Export null when no local MySQL is configured; chatbotLogic uses external API only.
 * To enable local storage, replace this with a real pool (e.g. mysql2.createPool(...)).
 */
module.exports = null;
