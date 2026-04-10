var nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,//465 secure:true
    auth: {
        user: 'gvr37.p.l.boon@gmail.com',
        pass: process.env.GMAIL_PASS
    }
});

async function sendmail(to,subject,html){
    const info = await transporter.sendMail({
        from: 'gvr37.p.l.boon@gmail.com',
        to: to,
        subject: subject,
        html: html,
    });

  console.log("Message sent:", info.messageId);
}

module.exports.sendmail = sendmail