module.exports = function(nodemailer){
    return{
        sendWelcome:function(emailAddr){

            //setup e-mail data with unicode symbols
            var mailOptions = {
                from: "Querye.com ✔ <queryeportal@gmail.com>", // sender address
                to: emailAddr+", "+emailAddr, // list of receivers
                subject: "Witaj w Querye, jak Ci się podoba?", // Subject line
                //text: "Hello world ✔", // plaintext body
                html: "<b>Witaj</b><br />Twoje konto na portalu Querye.com zostało utworzone." // html body
            }

            //Open transport pool
            var transport = nodemailer.createTransport("SMTP", {
                host: "smtp.gmail.com", // hostname
                secureConnection: true, // use SSL
                port: 465, // port for secure SMTP
                auth: {
                    user: "queryeportal@gmail.com",
                    pass: "ldqanwwaxqxqgs"
                }
            });

            // send mail with defined transport object
            transport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error);
                }else{
                    console.log("Message sent: " + response.message);
                }
            });



            //Close transport pool
            transport.close();
        }
    }

};
