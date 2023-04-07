const Category = require("../../models/category");
const Event = require("../../models/event");

module.exports = {
  categories: async () => {
    try {
      const categories = await Category.find();
      const sortedCategories = [...categories].sort((a, b) =>
        a.name > b.name ? 1 : -1
      );
      return sortedCategories.map((category) => {
        return {
          ...category._doc,
          _id: category._id,
        };
      });
    } catch (err) {
      throw err;
    }
  },
  createCategory: async (args) => {
    try {
      const doc = new Category({
        name: args.categoryInput.name,
        iconType: args.categoryInput.iconType,
        iconName: args.categoryInput.iconName,
        numberOfEvents: args.categoryInput.numberOfEvents,
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
  deleteCategory: async (args) => {
    try {
      const categoryToDelete = await Category.findOne({
        _id: args.categoryId,
      });
      if (!categoryToDelete) {
        throw new Error("No category to delete");
      } else {
        const result = await Category.deleteOne({
          _id: args.categoryId,
        });
        console.log(result);
      }
      return categoryToDelete;
    } catch (err) {
      throw err;
    }
  },
  updateCategory: async (args) => {
    try {
      const filter = args.categoryInput.categoryId;
      const update = args.categoryInput;
      console.log(update);
      let result = await Category.findByIdAndUpdate(filter, update, {
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
  getMostFrequentCategory: async (args) => {
    try {
      const categories = await Category.find();
      //Reset all number of events to 0
      categories.map((category) => {
        category.numberOfEvents = 0;
      });
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        1,
        0,
        0
      );
      const todayEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        59,
        59
      );
      const thisWeekStart = new Date(new Date() - 7 * 60 * 60 * 24 * 1000);
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      const nextMonthStart = new Date();
      nextMonthStart.setDate(1);
      nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);
      if (args.range == "Month") {
        const tempEvent = await Event.where({
          createdAt: {
            $gte: thisMonthStart,
            $lt: nextMonthStart,
          },
        }).populate("category");
        tempEvent.map((event) => {
          categories.map((category) => {
            if (event.category.id == category._id) {
              category.numberOfEvents = category.numberOfEvents + 1;
            }
            return {
              ...category._doc,
              _id: category._id,
            };
          });
        });
      } else if (args.range == "Week") {
        const tempEvent = await Event.where({
          createdAt: {
            $gte: thisWeekStart,
            $lte: todayEnd,
          },
        }).populate("category");
        tempEvent.map((event) => {
          categories.map((category) => {
            if (event.category.id == category._id) {
              category.numberOfEvents = category.numberOfEvents + 1;
            }
            return {
              ...category._doc,
              _id: category._id,
            };
          });
        });
      } else if (args.range == "Day") {
        const tempEvent = await Event.where({
          createdAt: {
            $gte: todayStart,
            $lte: todayEnd,
          },
        }).populate("category");
        tempEvent.map((event) => {
          categories.map((category) => {
            if (event.category.id == category._id) {
              category.numberOfEvents = category.numberOfEvents + 1;
            }
            return {
              ...category._doc,
              _id: category._id,
            };
          });
        });
      } else {
        console.log("Wrong argument");
      }

      return categories.map((category) => {
        category.save();
        return {
          ...category._doc,
          _id: category._id,
        };
      });
    } catch (err) {
      throw err;
    }
  },
};
