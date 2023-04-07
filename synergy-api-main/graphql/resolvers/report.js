const Report = require("../../models/report");
const User = require("../../models/user");
const { user } = require("./merge");
const { transformReport } = require("./merge");

module.exports = {
  reports: async () => {
    try {
      const reports = await Report.find()
        .populate("reportedUser")
        .populate("offenderUser");
      console.log("reports", reports);
      return reports.map((report) => {
        // console.log("new Date(report._doc.createdAt)", dayjs(new Date(report._doc.createdAt)).format('DD/MM/YYYY') );
        return {
          ...report._doc,
          _id: report._id,
        };
      });
    } catch (err) {
      throw err;
    }
  },
  createReport: async (args) => {
    try {
      const fetchedReportedUser = await User.findOne({
        _id: args.reportInput.reportedUser,
      });
      const fetchedOffenderUser = await User.findOne({
        _id: args.reportInput.offenderUser,
      });
      const doc = new Report({
        reportedUser: fetchedReportedUser,
        offenderUser: fetchedOffenderUser,
        reasonDetails: args.reportInput.reasonDetails,
        reasonCategory: args.reportInput.reasonCategory,
        status: args.reportInput.status,
      });
      const result = await doc.save();
      return {
        ...result._doc,
        _id: doc.id,
        createdAt: new Date(result._doc.createdAt).toISOString(),
        updatedAt: new Date(result._doc.updatedAt).toISOString(),
      };
    } catch (err) {
      throw err;
    }
  },
  deleteReport: async (args) => {
    try {
      const result = await Report.findByIdAndDelete(args.reportId);
      console.log(result);
      // if (!reportToDelete) {
      //   throw new Error("No report to delete");
      // } else {
      //   const result = await Report.deleteOne({
      //     _id: args._id,
      //   });
      //   console.log(result);
      // }
      return result;
    } catch (err) {
      throw err;
    }
  },
  banReport: async (args) => {
    try {
      const result = await Report.findByIdAndUpdate(args.reportId, {
        status: "Banned",
      });
      console.log(result);
      return result;
    } catch (err) {
      throw err;
    }
  },
  resolveReport: async (args) => {
    try {
      const result = await Report.findByIdAndUpdate(args.reportId, {
        status: "Resolved",
      });
      console.log(result);
      return result;
    } catch (err) {
      throw err;
    }
  },
  updateReport: async (args) => {
    try {
      const filter = args.reportId;
      const reportedUser = await User.findById(args.reportInput.reportedUser);
      const offenderUser = await User.findById(args.reportInput.offenderUser);

      console.log("reportedUser", reportedUser);
      const update = {
        reportedUser: reportedUser,
        offenderUser: offenderUser,
        reasonDetails: args.reportInput.reasonDetails,
        reasonCategory: args.reportInput.reasonCategory,
        status: args.reportInput.status,
      };
      console.log(update);
      let result = await Report.findByIdAndUpdate(filter, update, {
        new: true,
      });
      return {
        ...result._doc,
        _id: result.id,
        updatedAt: new Date(result._doc.updatedAt).toISOString(),
      };
    } catch (err) {
      throw err;
    }
  },
};
