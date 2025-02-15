const { CronJob } = require('cron');
const {Op} = require('sequelize');
const ChatHistory = require('../models/Message');
const ArchivedChat = require('../models/archived-chat');
exports.job = new CronJob(
    '0 0 * * *', 
    function () {
        archiveOldRecords();
    },
    null,
    false,
    'Asia/Kolkata'
);

async function archiveOldRecords() {
    try {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      // Find records to archive
      const recordsToArchive = await ChatHistory.findAll({
        where: {
          date_time: {
            [Op.lt]: tenDaysAgo,
          },
        },
      });
  
      // Archive records
      await Promise.all(
        recordsToArchive.map(async (record) => {
          await ArchivedChat.create({
            id: record.id,
            message: record.message,
            date_time: record.date_time,
            isImage:record.isImage,
            UserId: record.UserId,
            GroupId: record.GroupId,
            messageId: record.id,
          });
          await record.destroy();
        })
      );
      console.log('Old records archived successfully.');
    } catch (error) {
      console.error('Error archiving old records:', error);
    }
  }
