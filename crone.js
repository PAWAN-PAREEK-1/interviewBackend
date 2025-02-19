const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Task = require("./models/Task");
const User = require("./models/User");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pawan2pareek506@gmail.com",
    pass: "ftbh zawr sngk gwjn",
  },
});


cron.schedule("0 8 * * *", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    const tasksToRemind = await Task.find({ reminderDate: { $lte: today } }).populate("user");

    for (const task of tasksToRemind) {
      if (!task.user || !task.user.email) {
        console.log(`Skipping task "${task.title}" as user email is missing`);
        continue;
      }


      const mailOptions = {
        from: "pawan2pareek506@gmail.com",
        to: task.user.email,
        subject: "Task Reminder",
        text: `Hello ${task.user.name},\n\nReminder: Your task "${task.title}" is due on ${task.dueDate}.\n\nPlease complete it on time.\n\nBest Regards,\nYour Task Manager`,
      };

    
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error(`Error sending email to ${task.user.email}:`, err);
        else console.log(`Reminder sent to ${task.user.email}:`, info.response);
      });
    }
  } catch (err) {
    console.error("Error running cron job:", err);
  }
});
