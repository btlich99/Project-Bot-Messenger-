module.exports.config = {
  name: "out",
  version: "1.0.0",
  permssion: 2,
  Rent: 2,
  credits: "tkdev",
  description: "out box",
  category: "Admin-Hệ Thống",
  usages: "[tid]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const id = parseInt(args[0]) || event.threadID;
  return api.sendMessage('Đã nhận lệnh out nhóm từ admin!', id, () => api.removeUserFromGroup(api.getCurrentUserID(), id));
}
