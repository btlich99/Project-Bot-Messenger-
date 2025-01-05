const fs = require('fs');
const request = require('request');

module.exports.config = {
    name: "anoti",
    version: "1.0.0",
    permission: 2,
    credits: "ryuko",
    description: "",
    prefix: true,
    premium: false,
    category: "admin",
    usages: "[msg]",
    cooldowns: 5,
}

let atmDir = [];

const getAtm = (atm, body) => new Promise(async (resolve) => {
    let msg = {}, attachment = [];
    msg.body = body;
    for(let eachAtm of atm) {
        await new Promise(async (resolve) => {
            try {
                let response =  await request.get(eachAtm.url),
                    pathName = response.uri.pathname,
                    ext = pathName.substring(pathName.lastIndexOf(".") + 1),
                    path = __dirname + `/cache/${eachAtm.filename}.${ext}`
                response
                    .pipe(fs.createWriteStream(path))
                    .on("close", () => {
                        attachment.push(fs.createReadStream(path));
                        atmDir.push(path);
                        resolve();
                    })
            } catch(e) { console.log(e); }
        })
    }
    msg.attachment = attachment;
    resolve(msg);
})

module.exports.handleReply = async function ({ api, event, handleReply, Users, Threads, getText }) {
    
    const moment = require("moment-timezone");
      var gio = moment.tz("Asia/ho_chi_minh").format("DD/MM/YYYY - HH:mm:ss");
    const { threadID, messageID, senderID, body } = event;
    let name = await Users.getNameUser(senderID);
    switch (handleReply.type) {
        case "sendnoti": {
            let text = `${name} đã trả lời thông báo của bạn\n\nTime : ${gio}\nNội dung : ${body}\n\nNhóm : ${(await Threads.getInfo(threadID)).threadName || "unknown"}`;
            if(event.attachments.length > 0) text = await getAtm(event.attachments, `${body}${name} đã trả lời thông báo của bạn\n\ntime : ${gio}\n\nĐến : ${(await Threads.getInfo(threadID)).threadName || "unknown"}`);
            api.sendMessage(text, handleReply.threadID, (err, info) => {
                atmDir.forEach(each => fs.unlinkSync(each))
                atmDir = [];
                global.client.handleReply.push({
                    name: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    messID: messageID,
                    threadID
                })
            });
            break;
        }
        case "reply": {
            let text = `Admin ${name} Reply đến bạn\n\nNội dung : ${body}\n\nReply tin nhắn này để gửi lại cho admin.`;
            if(event.attachments.length > 0) text = await getAtm(event.attachments, `${body}${name} reply đến bạn\n\nreply to this message if you want to respond again.`);
            api.sendMessage(text, handleReply.threadID, (err, info) => {
                atmDir.forEach(each => fs.unlinkSync(each))
                atmDir = [];
                global.client.handleReply.push({
                    name: this.config.name,
                    type: "sendnoti",
                    messageID: info.messageID,
                    threadID
                })
            }, handleReply.messID);
            break;
        }
    }
}

module.exports.run = async function ({ api, event, args, Users }) {
    const moment = require("moment-timezone");
      var gio = moment.tz("Asia/ho_chi_minh").format("DD/MM/YYYY - HH:mm:ss");
    const { threadID, messageID, senderID, messageReply } = event;
    if (!args[0]) return api.sendMessage("Vui lòng nhập nội dung", threadID);
    let allThread = global.data.allThreadID || [];
    let can = 0, canNot = 0;
    let text = `Tin nhắn từ Admin\n\nTime : ${gio}\nName : ${await Users.getNameUser(senderID)}\nNội dung : ${args.join(" ")}\n\nReply tin nhắn này để phản hồi lại admin.`;
    if(event.type == "message_reply") text = await getAtm(messageReply.attachments, `message from admins\n\ntime : ${gio}\nadmin name : ${await Users.getNameUser(senderID)}\nmessage : ${args.join(" ")}\n\nreply to this message if you want to respond from this announce.`);
    await new Promise(resolve => {
        allThread.forEach((each) => {
            try {
                api.sendMessage(text, each, (err, info) => {
                    if(err) { canNot++; }
                    else {
                        can++;
                        atmDir.forEach(each => fs.unlinkSync(each))
                        atmDir = [];
                        global.client.handleReply.push({
                            name: this.config.name,
                            type: "sendnoti",
                            messageID: info.messageID,
                            messID: messageID,
                            threadID
                        })
                        resolve();
                    }
                })
            } catch(e) { console.log(e) }
        })
    })
    api.sendMessage(`send to ${can} thread, not send to ${canNot} thread`, threadID);
}
