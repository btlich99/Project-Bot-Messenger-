module.exports.config = {
  name: "ai",
  version: "1.1.0",
  permission: 0,
  credits: "tkdev",
  description: "Herc.Ai",
  prefix: false,
  premium: true,
  category: "Without prefix",
  usage: `ai (question)`,
  cooldowns: 3,
  dependencies: {
    "hercai": ""
  }
};

module.exports.run = async function({api, event, args}) {
  const message = args.join(" ");
  if (!message) {
    return api.sendMessage('Thiếu câu hỏi!');
  }
const { Hercai } = require('hercai');
const herc = new Hercai();
herc.question({
  model: "v3",
  content: message
}).then(response => {
api.sendMessage(response.reply, event.threadID, event.messageID);
});
}
