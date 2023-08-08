const Blog = require("../models/blog");
const Category = require("../models/category");

const fs = require("fs");

exports.get_blog_delete = async function (req, res) {
    const blogid = req.params.blogid;
    try {
        //silmek istediğimiz blogid seçer
        const blog = await Blog.findByPk(blogid);
        if (blog) {
            return res.render("admin/blog-delete", {
                title: "delete blog",
                blog: blog
            });
        }
        res.redirect("admin/blogs");
    } catch (error) {
        console.log(error);
    }
}

exports.post_blog_delete = async function (req, res) {
    const blogid = req.body.blogid;
    try {
        const blog = await Blog.findByPk(blogid);
        if (blog) {
            //seçilen blog silinmesi
            await blog.destroy();
            return res.redirect("/admin/blogs?action=delete");
        }
        res.redirect("/admin/blogs");
    } catch (error) {
        console.log(error);
    }
}

exports.get_category_delete = async function (req, res) {
    const categoryid = req.params.categoryid;
    try {
        //kategori silmek istediğimiz id seçip silme sayfasına yönlendirir
        const category = await Category.findByPk(categoryid);

        res.render("admin/category-delete", {
            title: "delete category",
            category: category
        });

    } catch (error) {
        console.log(error);
    }
}

exports.post_category_delete = async function (req, res) {
    const categoryid = req.body.categoryid;
    try {
        //categoryid seçtiğimiz id li kategori where ile kontrol edip siliyoruz
        await Category.destroy({
            where: {
                id: categoryid
            }
        });
        return res.redirect("/admin/categories?action=delete");
    } catch (error) {
        console.log(error);
    }
}

exports.get_blog_create = async function (req, res) {
    try {
        const categories = await Category.findAll();

        res.render("admin/blog-create", {
            title: "add blog",
            categories: categories
        });
    }
    catch (err) {
        console.log(err);
    }
}

exports.post_blog_create = async function (req, res) {
    const baslik = req.body.baslik;
    const altbaslik = req.body.altbaslik;
    const aciklama = req.body.aciklama;
    const resim = req.file.filename;
    const anasayfa = req.body.anasayfa == "on" ? 1 : 0;
    const onay = req.body.onay == "on" ? 1 : 0;
    const kategori = req.body.kategori;


    try {

        await Blog.create({
            baslik: baslik,
            altbaslik: altbaslik,
            aciklama: aciklama,
            resim: resim,
            anasayfa: anasayfa,
            onay: onay,
            categoryId: kategori,
        });
        res.redirect("/admin/blogs?action=create");
    }
    catch (err) {
        console.log(err);
    }
}

exports.get_category_create = async function (req, res) {
    try {
        res.render("admin/category-create", {
            title: "add category",
        });
    }
    catch (err) {
        console.log(err);
    }
}

exports.post_category_create = async function (req, res) {
    const name = req.body.name;
    try {
        await Category.create({ name: name });
        res.redirect("/admin/categories?action=create");
    }
    catch (err) {
        console.log(err);
    }
}

exports.get_blog_edit = async function (req, res) {
    const blogid = req.params.blogid;

    try {
        const blog = await Blog.findOne({
            where: {
                id: blogid
            },
            // blogda seçilen kategorilere blog edit sayfasında ulaşmak için 
            include: {
                model: Category,
                attributes: ["id"]
            }
        })
        const categories = await Category.findAll();


        if (blog) {
            return res.render("admin/blog-edit", {
                title: blog.dataValues.baslik,
                blog: blog.dataValues,
                categories: categories
            });
        }
        res.redirect("/admin/blogs");
    } catch (error) {
        console.log(error);
    }

}

exports.post_blog_edit = async function (req, res) {
    const blogid = req.body.blogid;
    const baslik = req.body.baslik;
    const altbaslik = req.body.altbaslik;
    const aciklama = req.body.aciklama;
    let resim = req.body.resim;
    // kullanıcı dosyadan resim seçerse
    if (req.file) {
        resim = req.file.filename;

        //eski kullanılmayan resimin silinmesi
        fs.unlink("./public/images/" + req.body.resim, err => {
            console.log(err)
        });
    }
    const anasayfa = req.body.anasayfa == "on" ? 1 : 0;
    const onay = req.body.onay == "on" ? 1 : 0;
    const kategori_id = req.body.kategori;

    try {
        // blogları güncellemek için blogid alıyoruz ona göre if içerisinde güncelleme yaptığımız alanları giriyoruz
        const blog = await Blog.findByPk(blogid);
        if (blog) {
            blog.baslik = baslik;
            blog.altbaslik = altbaslik;
            blog.aciklama = aciklama;
            blog.resim = resim;
            blog.anasayfa = anasayfa;
            blog.onay = onay;
            blog.categoryId = kategori_id;

            await blog.save();
            return res.redirect("/admin/blogs?action=edit&baslik=" + baslik);
        }
    } catch (err) {
        res.redirect("/admin/blogs");
        console.log(err);
    }

}

exports.get_category_edit = async function (req, res) {
    const categoryid = req.params.categoryid;

    try {
        const category = await Category.findByPk(categoryid);
        const blogs = await category.getBlogs();
        const countBlog = await category.countBlogs();

        if (category) {
            return res.render("admin/category-edit", {  //sayfaya gönderdik
                title: category.dataValues.name,
                category: category.dataValues,
                blogs: blogs,
                countBlog: countBlog
            });
        }

        res.redirect("admin/categories");
    }
    catch (err) {
        console.log(err);
    }

}

exports.post_category_edit = async function (req, res) {
    const categoryid = req.body.categoryid;
    const name = req.body.name;

    try {
        await Category.update({ name: name }, {
            where: {
                id: categoryid
            }
        });
        return res.redirect("/admin/categories?action=edit&categoryid=" + categoryid);
    } catch (err) {
        console.log(err);
    }

}

exports.get_blogs = async function (req, res) {
    try {
        const blogs = await Blog.findAll({
            attributes: ["id", "baslik", "altbaslik", "resim"],
            include: {
                model: Category,
                attributes: ["name"]
            }
        });
        res.render("admin/blog-list", {
            title: "blog list",
            blogs: blogs,   //blog kayıtlarını gönderdik 
            action: req.query.action,
            blogid: req.query.blogid
        })
    } catch (err) {
        console.log(err);

    }
}

exports.get_categories = async function (req, res) {
    try {
        const categories = await Category.findAll(); //burada ise tüm blog kayıtlarından sadece id baslik aciklama kısımlarını aldık
        console.log(categories);

        res.render("admin/category-list", {
            title: "blog list",
            categories: categories,   //blog kayıtlarını gönderdik 
            action: req.query.action,
            categoryid: req.query.categoryid
        })
    } catch (err) {
        console.log(err);

    }
}