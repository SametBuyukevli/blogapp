const express = require("express");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

const path = require("path");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");


app.use("/libs", express.static(path.join(__dirname, "node_modules")));
app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(userRoutes);

const sequelize = require("./data/db");
const dummyData = require("./data/dummy-data");
const Category = require("./models/category");
const Blog = require("./models/blog");

// ilişkiler
//one to many 
// Category.hasMany(Blog, {
//     foreignKey: {           //! blog içerisine ilişkiden dolayı gelen categoryId name değiştirdik ve not null yaptık!  
//         name: "categoryId",
//         allowNull: true,
//*        // defaultValue: 1
//     },
//     onDelete: "SET NULL",
//     onUpdate: "SET NULL",
// }); //! Bir kategori de birden fazla blog a sahip olabilir 
// Blog.belongsTo(Category);   //! Bir Blog bir kategori ye sahip olabilir

//many to many
Blog.belongsToMany(Category, { through: "BlogCategories" });
Category.belongsToMany(Blog, { through: "BlogCategories" });


// uygulanması -sync 

//IIFE
(async () => {
    await sequelize.sync({ force: true });
    await dummyData();
})();

app.listen(3000, function () {
    console.log("listening on port 3000");
});