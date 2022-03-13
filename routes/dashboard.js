var express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const {validationResult} = require('express-validator')
const flash = require('express-flash')
const multer = require('multer');
const { diskStorage } = require("multer");
const storageConfig = multer.diskStorage({
  destination: function (req,res,cb) {
    cb(null,'./public/images')
  },
  filename: function (req,file,cb) {
    let baseUrl = 'http://localhost:3000'
    let extension = file.mimetype.split('/')[1]
    cb(null,`${Date.now()}-${file.originalname}`)
  }
})
const upload = multer({storage:storageConfig})
// const upload = multer({dest: './public/images'})

const prisma = new PrismaClient();
let role, name, urlName;
/* GET home page. */
router.get("/", checkAuthenticated, async function (req, res, next) {
  let countUser = await prisma.user.count();
  let countProducts = await prisma.food.count();
  let countCategory = await prisma.category.count()
  let countOrder = await prisma.order.count();
  role = req.session.passport.user.role;
  nameUser = req.session.passport.user.name;
  urlName = req.originalUrl;
  let data = {
    url: urlName,
    name: nameUser,
    totalUser: countUser,
    totalProduct: countProducts,
    totalCategory: countCategory,
    totalOrder: countOrder,
    roleUser: role,
  };
  res.render("dashboard/index", data);
});

router.get("/profile", checkAuthenticated, (req, res) => {
  urlName = req.originalUrl;
  let data = {
    url: urlName,
    name: nameUser,
    allUser: user,
    roleUser: role,
  };
  res.render("dashboard/profile", data);
});

router.get('/product', checkAuthenticated, async (req,res) => {
  const allProduct = await prisma.food.findMany({
    include: {
      category: {
        select: {
          name: true
        }
      }
    }
  })
  urlName = req.originalUrl;
  console.log(urlName)
  let data = {
    url: urlName,
    name: nameUser,
    roleUser: role,
    products: allProduct
  };
  console.log(allProduct)
  res.render("dashboard/food", data);
})

router.get('/product/tambah', async (req,res) => {
  let dataCategory = await prisma.category.findMany({})
  let successMsg = req.flash('pesan')
  res.render('dashboard/foodTambah', {
    title:'Tambah Makanan',
    tags: dataCategory,
    successMsg
  })
})

router.post('/product/tambah',checkAuthenticated, upload.single('image'), async (req,res) => {
  let extensionImage = req.file.mimetype.split('/')[1]
  let imageUrl = `http://localhost:3000/images/${req.file.filename}` 
  let createProduct = await prisma.food.create({
    data :{
      title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    categoryId: Number(req.body.categoryId),
    image: imageUrl,
    },
  })
  req.flash('pesan','Data Telah Ditambahkan')
  res.redirect('/dashboard/product/tambah')
  // res.send({file:req.file,body:req.body,data:createProduct})
})
router.get('/product/:id/detail', (req,res) => {
  res.render('dashboard/foodDetail')
})

router.get("/user", checkAuthenticated, async (req, res) => {
  let user = await prisma.user.findMany({});
  urlName = req.originalUrl;
  let data = {
    url: urlName,
    name: nameUser,
    allUser: user,
    roleUser: role,
  };
  res.render("dashboard/User", data);
});

router.get('/user/add', checkAuthenticated, (req,res) => {
  res.render('dashboard/UserAdd')
})

router.post('/user/add', async (req, res) => {
  try {
    const hashPassword = await bcrypt.hash(req.body.password,10)
    const user = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      password: hashPassword
    }
  })
  
  res.redirect('/dashboard/user')
  } catch (e) {
    // res.redirect('dashboard/user')
  }
})

router.get('/category',checkAuthenticated, async (req,res) => {
  let getDatas = await prisma.category.findMany({
    include: {
      foods: true
    }
  })
  for(let i=0;i<getDatas.length;i++){
    getDatas[i].foods = getDatas[i].foods.length
  }
  urlName = req.originalUrl;
  let data = {
    url: urlName,
    name: nameUser,
    roleUser: role,
    dataCategory: getDatas
  };
  console.log(getDatas)
  res.render('dashboard/category',data)
})

router.post('/category',(req,res) => {

})
router.get('/order',checkAuthenticated,async (req,res) => {
  let listOrder = await prisma.order.findMany({
    include: {
      pelayan: {
        select: {
          name: true
        }
      }
    },
    where: {
      status: {
        equals: 'WAITING'
      }
    }
  })
  
  urlName = req.originalUrl;
  let data = {
    url: urlName,
    name: nameUser,
    roleUser: role,
    list: listOrder,
  }
  console.log(listOrder)
  res.render('dashboard/order', data)
})
router.get('/query-search',async (req,res) => {
  let search = req.query.food
  let querySearch = await prisma.food.findMany({
    where: {
      title: {
        contains : search,
      }
    }
  })
  
  res.send(querySearch)
})
router.get('/find-one/:name',async (req,res) => {
  let food = await prisma.food.findMany({
    where: {
      title: {
        contains: req.params.name.replace('%20',' ')
      }
    }
  })
  res.send(food)
})
router.get('/list-products',async (req,res) => {
  let products = await prisma.food.findMany({})
  res.send(products)
})

router.post('/order',checkAuthenticated,async (req,res) => {
  const userId = req.session.passport.user.id
  const objIdFood = req.body.foods
  const arrayQty = Number(req.body.quantity)

  const arrIdFoods = []
  for(let i=0;i<req.body.foods;i++){
    let tmp = {}
    tmp['title'] = req.body.foods[i]
    arrIdFoods.push(tmp)
  }
  const priceFood = await prisma.food.findMany({
    where: {
      id: {
        in: req.body.foods
      }
    },
    select: {
      price: true
    }
  })
  const namaMakanan = await prisma.food.findMany({
    where: {
      id: {
        in: req.body.foods
      }
    },
    select: {
      title: true
    }
  })
  let listNamaMakanan = namaMakanan.map(val => String(val.title))
  let totalHarga = 0
  let connectFoodIds = []
  if(Number.isInteger(arrayQty)) {
      totalHarga += Number(priceFood.map((val,idx) => val.price * Number(arrayQty)))
      // let tmp = {
      //   food: {
      //     connect :{ id : req.body.foods}
      //   }
      // }
      // tmp['food']['connect']['id'] = req.body.foods
      // connectFoodIds.push(tmp)
  } else if(req.body.quantity.constructor == Array ) {
      let arrQty = req.body.quantity
      totalHarga = arrQty.map((val,idx) => Number(val) * priceFood[idx].price)
      totalHarga = Number(totalHarga.reduce((acc,curr) => Number(acc) + Number(curr),0))
      
      
  }
  if(req.body.foods.constructor == String) {
    let tmp = {
      food: {
        connect: {id: req.body.foods}
      }
    }
    connectFoodIds.push(tmp)
  } else if(req.body.foods.constructor == Array) {
    for(let i=0;i<req.body.foods.length;i++){
    
      let tmp = {
        food: {
          connect :{}
        }
      }
      tmp['food']['connect']['id'] = req.body.foods[i]
      connectFoodIds.push(tmp)
    }
  }
  
  
  // console.log(connectFoodIds)
  // let 
  // for(let i=0;i<ids.length;i++){
  //   let tmpObj = {
  //     food :{
  //       connect :{}
  //     }
  //   }
  //   tmpObj['food']['connect']['id'] = ids[i]
  //   tmp.push(tmpObj)
  // }
  // console.log('array'+connectFoodIds.food)
  // console.log(req.body.foods)
  const order = await prisma.order.create({
    data: {
      pelayan: {
        connect: {id : userId},
      },
      pemesan: req.body.pemesan,
      price: totalHarga,
      foodsDetail: {
        create: connectFoodIds
      },  
      foods: listNamaMakanan.join(),
      payment: {
        create: {
          kembalian: 0,
          pembayaran: 0,
          income: 0,

        }
      }
    }
  })
  console.log({body:req.body, pelayanId:userId, harga:priceFood,jumlah: typeof arrayQty, total: totalHarga, listFoods: listNamaMakanan.join()})
  res.send({body:req.body, pelayanId:userId, harga: priceFood})
})
router.get('/pesanan',checkAuthenticated,(req,res) => {
  res.render('dashboard/orderForm')
})


// payment 
router.get('/payment',() => {

})
router.get('/payment/:id',async (req,res) => {
  let data = await prisma.order.findUnique({
    where: {
      id: req.params.id
    },
    include:{
      payment: true
    }
  })
  console.log(data)
  res.render('dashboard/payment', {data} )
})

router.post('/payment',async (req,res) => {
  
  let order = await prisma.order.findUnique({
    where: {
      id: req.body.orderId
    }
  })

  let kembalianOrder = order.price - Number(req.body.bayar) 
  console.log({
    body: req.body,
    kembalian: kembalianOrder,
    totalHarga: order.price
  })
  res.send(req.body)
  let updateBayar = await prisma.order.update({
    where: {
      id: req.body.orderId
    },
    data: {
      status: 'PAID',
      payment: {
        update: {
          pembayaran: Number(req.body.bayar),
          kembalian: kembalianOrder,
          income: order.price
        }
      }
    },
  })
  
  // console.log(
  //   {
  //     price:price,
  //     pembayaran: updateBayar,
  //     body:req.body
  //   }
  // )
  res.send({
    price:order.price,
    pembayaran: updateBayar,
    body:req.body
  })
  
})

router.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/users/login");
});
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/users/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) res.redirect("/dashboard");
  next();
}

module.exports = router;
