import axios from 'axios';
import bcrypt from 'bcrypt';
import DBMS from '../components/dbms/dbms.js';
import app from '../middleware.js';
import Config from '../components/config/config.js';
import Repository from '../components/repository/repository.js';

export default class TrialTests {
  constructor() {
    this.dbms = new DBMS(app);
    this.config = new Config().getConfig();
    this.PROFILES = this.config.PROFILES;
    this.SERVER_URL = this.config.SERVER_URL;
    this.repo = new Repository();
  }

  async init() {
    try {
      console.log('--- Running Dev Trial Tests ---');
      // Método para cargar el menú y sus categorías

      await this.runAPITest('/', { method: 'GET' });

      const userData = {
        username: 'Pepito',
        password: 'QWEqwe123·',
        confirmPassword: 'QWEqwe123·',
        email: 'luisdavidbustosnunez@gmail.com',
        profile: this.PROFILES.ADMIN,
      };

      // await this.loadMenuData(dataAPI.menu);

      // const res = await this.repo.setUserProfile(
      //   userData.username,
      //   userData.profile.name
      // );
      // console.log('Set user profile result:', res ? 'successful' : 'error');

      // await this.repo.getUserProfiles(userData.username).then((profiles) => {
      //   console.log(`Profiles for user ${userData.username}:`, profiles);
      // });

      // await this.registerUserTest(userData);

      // const users = await this.dbms.query('/users', {
      //   method: 'GET',
      //   contentType: 'application/json',
      // });
      // console.log('Users fetched:', users);

      // const users = await this.repo.getUsersWhere({
      //   email: 'luisdavidbustosnunez@gmail.com',
      // });
      // console.log('Users matched:', users);

      // const path = '/users';
      // const params = { method: 'GET' };
      // const data = await this.dbms.query(path, params);
      // console.log(`Response ${path}: `, data);

      // const path = '/user_profiles';
      // const response = await this.runAPITest(path, {
      //   method: 'GET',
      // });
      // console.log(`Response ${path}: `, response.status);

      console.log('--- Dev Trial Tests Completed ---');
    } catch (error) {
      console.log('Error running dev trial tests:', error);
    }
  }

  async loadMenuData(menuData) {
    try {
      // 1. Obtener todas las categorías existentes
      const existingCategoriesRes = await axios.get(
        `${this.SERVER_URL}/categories`
      );
      const existingCategories = existingCategoriesRes.data || [];
      const categoryNameToId = {};
      existingCategories.forEach((cat) => {
        console.log('Cat existente:', cat.name, cat._id);
        categoryNameToId[cat.name] = cat._id;
      });

      // 2. Recorrer cada platillo del menú
      for (const dish of menuData) {
        const categoryIds = [];
        // 2.1. Verificar/crear cada categoría
        for (const catName of dish.categories) {
          let catId = categoryNameToId[catName];
          if (!catId) {
            // Crear la categoría si no existe
            const newCatRes = await axios.post(`${this.SERVER_URL}/category`, {
              name: catName,
              description: '',
            });
            catId = newCatRes.data._id;
            categoryNameToId[catName] = catId;
          }
          categoryIds.push(catId);
        }

        // 2.2. Verificar si el dish ya existe
        let dishExists = false;
        try {
          const dishRes = await axios.get(
            `${this.SERVER_URL}/dish/by-id-api/${dish.id_api}`
          );
          dishExists = dishRes.status === 200 && dishRes.data;
        } catch (e) {
          dishExists = false;
        }

        // 2.3. Crear el dish si no existe
        if (!dishExists) {
          await axios.post(`${this.SERVER_URL}/dish`, {
            id_api: dish.id_api,
            title: dish.title,
            description: dish.description,
            cost_unit: dish.cost_unit,
            id_categories: categoryIds,
            extras: dish.extras,
            preview_img: dish.preview_img || '',
          });
          console.log(`Dish "${dish.title}" creado.`);
        } else {
          console.log(`Dish "${dish.title}" ya existe.`);
        }
      }
      console.log('Carga de menú completada.');
    } catch (error) {
      console.error(
        'Error cargando menú:',
        error.code,
        error.response.method,
        error.response.data
      );
    }
  }

  async registerUserTest(userData) {
    let ret = null;
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      // Copia el resto de los datos del body y reemplaza la contraseña
      userData = {
        status: 'active',
        register_date: new Date().toISOString(),
        ...userData,
        password: hashedPassword,
      };

      await axios
        .post(`${this.SERVER_URL}/user`, {
          username: userData.username,
          password: userData.password,
          email: userData.email,
          status: userData.status,
          register_date: userData.register_date,
        })
        .then(async (objuser) => {
          if (objuser.status === 200) {
            console.log('User registration test successful.');
            ret = objuser.data;
          } else {
            console.log('User registration test failed.');
          }
          console.log('----------------------------');
        })
        .catch((error) => {
          console.log('Error creating user:', error);
        });
    } catch (error) {
      console.log('Error in user creation trial test:', error);
    }
    return ret;
  }

  async runAPITest(path, params = {}) {
    let ret = null;
    await fetch(`${this.SERVER_URL}${path}`, params)
      .then((response) => {
        if (response.statusText === 'OK' && response.status === 200) {
          ret = response;
          console.log(path);
          console.log(`...Test Successful.`);
          console.log('----------------------------');
        } else {
          console.log(path);
          console.log(`...Test Failed:'`);
          console.log('----------------------------');
        }
      })
      .catch((error) => {
        ret = error;
        console.log(path);
        console.log(`...Test Error:'`);
        console.log('----------------------------');
      });

    return ret;
  }
}

const dataAPI = {
  brand_name: 'Dash Dish',
  slogan: 'Quality, Served at the Speed of Life.',
  menu: [
    {
      id_api: 'DB001',
      title: 'Tokyo Grain Bowl',
      description:
        'Arroz de sushi y quinua, atún marinado en soya y jengibre, edamame, aguacate y aderezo wasabi-lima.',
      cost_unit: 14.5,
      categories: ['Dash Bowls', 'Seafood', 'Healthy'],
      extras: [
        { name: 'Proteína Doble', cost: 4.0 },
        { name: 'Aguacate Extra', cost: 1.5 },
      ],
      preview_img:
        'https://maisonmarmite.com/wp-content/uploads/2025/07/Tokyo-Street-Bowl-11.jpg',
    },
    {
      id_api: 'DB002',
      title: 'Mediterranean Mezze',
      description:
        'Cuscús perlado, pollo al limón a la parrilla, pepino, tomate cherry, aceitunas Kalamata, queso feta y salsa tzatziki.',
      cost_unit: 13.9,
      categories: ['Dash Bowls', 'Poultry', 'Main Dish'],
      extras: [
        { name: 'Hummus Adicional', cost: 1.0 },
        { name: 'Pan Pita Tostado', cost: 1.5 },
      ],
      preview_img:
        'https://cdn.loveandlemons.com/wp-content/uploads/2022/08/mezze-platter.jpg',
    },
    {
      id_api: 'DB003',
      title: 'Southwest Chili Bowl',
      description:
        'Base de arroz integral, chili de carne lento y ahumado, crema agria, cilantro fresco y jalapeños encurtidos.',
      cost_unit: 12.8,
      categories: ['Dash Bowls', 'Beef', 'Comfort Food'],
      extras: [
        { name: 'Queso Cheddar Rallado', cost: 1.0 },
        { name: 'Crema Agria Extra', cost: 0.5 },
      ],
      preview_img:
        'https://cookingwithcurls.com/wp-content/uploads/2016/10/Theres-nothing-better-than-a-hearty-bowl-of-Southwest-Chili-with-Black-Beans-and-Corn-on-a-cold-winter-day-cookingwithcurls.com_-500x375.jpg',
    },
    {
      id_api: 'DB004',
      title: 'Vegan Power Bowl',
      description:
        'Base de col rizada y espinacas, tofu salteado en salsa de maní, batata asada, garbanzos y nueces tostadas.',
      cost_unit: 13.5,
      categories: ['Dash Bowls', 'Vegan', 'Healthy', 'Plant-Based'],
      extras: [
        { name: 'Tofu Doble', cost: 3.5 },
        { name: 'Semillas de Calabaza', cost: 1.0 },
      ],
      preview_img:
        'https://halsanutrition.com/wp-content/uploads/2016/10/1-PA210459.jpg',
    },
    {
      id_api: 'DB005',
      title: 'Jerk Chicken Bowl',
      description:
        'Arroz con coco, pollo jerk especiado, frijoles negros, plátano maduro frito y salsa de mango picante.',
      cost_unit: 14.2,
      categories: ['Dash Bowls', 'Poultry', 'Spicy'],
      extras: [
        { name: 'Pollo Doble', cost: 4.0 },
        { name: 'Salsa Picante Extra', cost: 0.5 },
      ],
      preview_img:
        'https://cdn.apartmenttherapy.info/image/upload/f_jpg,q_auto:eco,c_fill,g_auto,w_1500,ar_1:1/k%2FPhoto%2FRecipes%2F2021-09-jerk-chicken-bowls%2F2021-09-21_ATK11159',
    },
    {
      id_api: 'SW001',
      title: 'The Sterling Club',
      description:
        'Pollo desmenuzado, bacon ahumado, queso suizo, lechuga romana y aderezo especial de hierbas en pan de masa madre.',
      cost_unit: 11.9,
      categories: ['Sandwiches & Wraps', 'Poultry', 'Main Dish'],
      extras: [
        { name: 'Bacon Extra', cost: 1.5 },
        { name: 'Cambio a Pan Integral', cost: 0.5 },
      ],
      preview_img:
        'https://www.thestirlingclub.com/_filelib/ImageGallery/2023_Site_Design/galleries/dining/food-1080-1920-B.png',
    },
    {
      id_api: 'SW002',
      title: 'Prosciutto Panini',
      description:
        'Prosciutto di Parma, queso mozzarella fresca, rúcula, tomate seco y un toque de pesto en pan ciabatta prensado.',
      cost_unit: 12.5,
      categories: ['Sandwiches & Wraps', 'Pork', 'Main Dish'],
      extras: [
        { name: 'Queso Adicional', cost: 1.5 },
        { name: 'Pesto Extra', cost: 0.75 },
      ],
      preview_img:
        'https://parmacrown.com/wp-content/uploads/2015/03/Panini-1000x702.jpg',
    },
    {
      id_api: 'SW003',
      title: 'Spicy Tuna Melt Wrap',
      description:
        'Ensalada de atún con alioli de sriracha, queso Monterey Jack derretido y espinacas tiernas, envuelto en tortilla integral.',
      cost_unit: 10.9,
      categories: ['Sandwiches & Wraps', 'Seafood', 'Spicy'],
      extras: [
        { name: 'Doble Atún', cost: 3.0 },
        { name: 'Sriracha Adicional', cost: 0.5 },
      ],
      preview_img:
        'https://mallorythedietitian.com/wp-content/uploads/2024/06/tuna-wrap-melt-FI.jpg',
    },
    {
      id_api: 'SW004',
      title: 'BBQ Pulled Pork Roll',
      description:
        'Cerdo deshebrado a la barbacoa, cebolla morada encurtida y ensalada de col crujiente en un brioche suave.',
      cost_unit: 11.5,
      categories: ['Sandwiches & Wraps', 'Pork', 'Comfort Food'],
      extras: [
        { name: 'Salsa BBQ Extra', cost: 0.5 },
        { name: 'Queso Provolone', cost: 1.0 },
      ],
      preview_img:
        'https://carlsbadcravings.com/wp-content/uploads/2018/01/BBQ-Pulled-Pork-1.jpg',
    },
    {
      id_api: 'SW005',
      title: 'Veggie Focaccia',
      description:
        'Vegetales de temporada asados (calabacín, pimiento, berenjena), queso de cabra y reducción balsámica en pan focaccia.',
      cost_unit: 10.8,
      categories: ['Sandwiches & Wraps', 'Vegetarian', 'Main Dish'],
      extras: [
        { name: 'Queso de Cabra Extra', cost: 2.0 },
        { name: 'Balsámico Extra', cost: 0.5 },
      ],
      preview_img:
        'https://www.tasteofhome.com/wp-content/uploads/2017/09/exps37055_13X9163826B10_27_5b.jpg',
    },
    {
      id_api: 'EC001',
      title: 'Prime Beef Burger',
      description:
        '150g de carne prime con queso cheddar añejo, lechuga y tomate, en un pan brioche con aderezo secreto.',
      cost_unit: 13.9,
      categories: ['Elevated Classics', 'Beef', 'Main Dish', 'Comfort Food'],
      extras: [
        { name: 'Hamburguesa Doble', cost: 5.0 },
        { name: 'Huevo Frito', cost: 1.5 },
      ],
      preview_img:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxCabT4y-j9iH9W7fqBelNEgj4roUYwFCk-g&s',
    },
    {
      id_api: 'EC002',
      title: 'Truffle Mac & Cheese',
      description:
        'Macarrones con salsa de queso Gruyère y Parmesano, aromatizados con aceite de trufa blanca y migas de pan tostado.',
      cost_unit: 11.5,
      categories: ['Elevated Classics', 'Vegetarian', 'Comfort Food'],
      extras: [
        { name: 'Bacon Crumble', cost: 2.0 },
        { name: 'Champiñones Salteados', cost: 1.5 },
      ],
      preview_img:
        'https://www.olivelle.com/cdn/shop/articles/truffled-mac-cheese-recipe-web-1024x1024.jpg?v=1523467010&width=1024',
    },
    {
      id_api: 'EC003',
      title: 'Crispy Fish Tacos (2pc)',
      description:
        'Pescado blanco rebozado y crujiente, col rallada, crema de aguacate y salsa de chile chipotle en tortilla de maíz.',
      cost_unit: 12.9,
      categories: ['Elevated Classics', 'Seafood', 'Main Dish', 'Spicy'],
      extras: [
        { name: 'Taco Adicional', cost: 6.5 },
        { name: 'Salsa Chipotle Extra', cost: 0.75 },
      ],
      preview_img:
        'https://cdn.saltandpestle.com/blobsandpbloga3e5c214e72/wp-content/uploads/2022/01/crispy-fish-tacos-with-panko-and-spicy-mayo-lr-8.jpg',
    },
    {
      id_api: 'EC004',
      title: 'Chicken Tenders Gourmet',
      description:
        'Tiras de pollo empanizadas con panko y especias, servidas con una selección de dos salsas signature.',
      cost_unit: 10.5,
      categories: ['Elevated Classics', 'Poultry', 'Side Dishes', 'Appetizers'],
      extras: [
        { name: 'Salsas Extra (c/u)', cost: 0.75 },
        { name: 'Ajo Parmesano', cost: 1.0 },
      ],
      preview_img:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtCZ1r7PycFLx2Un6-Qq_UOzvIy0DjnLKNug&s',
    },
    {
      id_api: 'EC005',
      title: 'Grilled Salmon Plate',
      description:
        'Salmón a la parrilla con glaseado de miel y soya, acompañado de espárragos al vapor. (Opción Keto-Friendly).',
      cost_unit: 16.9,
      categories: ['Elevated Classics', 'Seafood', 'Healthy', 'Keto'],
      extras: [
        { name: 'Glaseado Extra', cost: 1.0 },
        { name: 'Mantequilla de Ajo', cost: 1.5 },
      ],
      preview_img:
        'https://www.allrecipes.com/thmb/CfocX_0yH5_hFxtbFkzoWXrlycs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ALR-12720-grilled-salmon-i-VAT-4x3-888cac0fb8a34f6fbde7bf836850cd1c.jpg',
    },
    {
      id_api: 'GG001',
      title: 'Caesar Royale',
      description:
        'Lechuga romana, aderezo César cremoso, croûtons de pan de ajo, lascas de parmesano y tiras de pollo a la parrilla.',
      cost_unit: 12.5,
      categories: ['Garden & Greens', 'Poultry', 'Main Dish'],
      extras: [
        { name: 'Pollo Extra', cost: 4.0 },
        { name: 'Camarones a la Parrilla', cost: 5.5 },
      ],
      preview_img:
        'https://www.lycheeegypt.com/wp-content/uploads/2022/03/gall-chicken-caesar-salad.jpg',
    },
    {
      id_api: 'GG002',
      title: 'Quinoa & Feta Salad',
      description:
        'Mezcla de quinua, espinacas baby, pimiento rojo, cebolla roja, nueces pecanas y vinagreta de limón y miel.',
      cost_unit: 11.9,
      categories: ['Garden & Greens', 'Vegetarian', 'Healthy', 'Main Dish'],
      extras: [
        { name: 'Queso Feta Adicional', cost: 1.5 },
        { name: 'Proteína de Salmón', cost: 5.5 },
      ],
      preview_img:
        'https://www.eatingwell.com/thmb/boEeA5jmWv4Bv5lJdzyArnW7_mI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/EW_SEO25_GreekInspiredQuinoaSalad_0516_preview-1-6cda3bc60c4b4aafbe831b2689657248.jpg',
    },
    {
      id_api: 'GG003',
      title: 'Cobb de Luxe',
      description:
        'Base de mezcla de lechugas, tomate, huevo duro, bacon, pollo, aguacate y aderezo bleu cheese cremoso.',
      cost_unit: 13.9,
      categories: ['Garden & Greens', 'Poultry', 'Main Dish'],
      extras: [
        { name: 'Aguacate Extra', cost: 1.5 },
        { name: 'Aderezo Extra', cost: 0.75 },
      ],
      preview_img:
        'https://dutchfarms.com//wp-content/uploads/2021/06/3-40-1024x683.jpg',
    },
    {
      id_api: 'GG004',
      title: 'Mango & Black Bean Salad',
      description:
        'Col rizada, frijoles negros, maíz, cebolla roja, cubos de mango fresco y aderezo de chipotle-lima.',
      cost_unit: 10.9,
      categories: ['Garden & Greens', 'Vegan', 'Healthy', 'Spicy'],
      extras: [
        { name: 'Pollo Desmenuzado', cost: 4.0 },
        { name: 'Queso Cotija', cost: 1.5 },
      ],
      preview_img:
        'https://plantbasedonabudget.com/wp-content/uploads/2013/09/Mango-Bean-Salad-1-2.jpg',
    },
    {
      id_api: 'GG005',
      title: 'Simple House Salad',
      description:
        'Base de lechuga romana y primavera, tomate, pepino y zanahoria rallada con vinagreta de la casa.',
      cost_unit: 8.5,
      categories: ['Garden & Greens', 'Vegetarian', 'Side Dishes', 'Healthy'],
      extras: [
        { name: 'Vinagreta Extra', cost: 0.5 },
        { name: 'Pollo o Tofu', cost: 4.0 },
      ],
      preview_img:
        'https://www.peelwithzeal.com/wp-content/uploads/2023/01/house-salad-recipe.jpg',
    },
    {
      id_api: 'SD001',
      title: 'Garlic Herb Fries',
      description:
        'Papas fritas cortadas a mano, sazonadas con sal marina, ajo y hierbas frescas.',
      cost_unit: 4.5,
      categories: ['Side Dishes', 'Comfort Food', 'Appetizers'],
      extras: [
        { name: 'Queso Parmesano', cost: 1.0 },
        { name: 'Alioli de Ajo', cost: 0.75 },
      ],
      preview_img:
        'https://lindseyeatsla.com/wp-content/uploads/2021/11/LindseyEats_Fries_Aioli-9.jpg',
    },
    {
      id_api: 'SD002',
      title: 'Sweet Potato Fries',
      description:
        'Batatas fritas servidas con un toque de sal y azúcar morena.',
      cost_unit: 4.9,
      categories: ['Side Dishes', 'Vegetarian', 'Appetizers'],
      extras: [
        { name: 'Salsa Ranchera', cost: 0.75 },
        { name: 'Miel de Arce Picante', cost: 1.0 },
      ],
      preview_img:
        'https://thegirlonbloor.com/wp-content/uploads/2021/10/Air-Fryer-Sweet-Potato-Fries-10.jpg',
    },
    {
      id_api: 'SD003',
      title: 'Truffle Caesar Side',
      description:
        'Porción individual de la ensalada César, con el toque de trufa.',
      cost_unit: 5.5,
      categories: ['Side Dishes', 'Appetizers'],
      extras: [{ name: 'Croûtons Extra', cost: 0.5 }],
      preview_img:
        'https://bitsofcarey.com/wp-content/uploads/2022/07/IMG_3052-500x500.jpg',
    },
    {
      id_api: 'SD004',
      title: 'Seasonal Roasted Veggies',
      description:
        'Selección de vegetales de temporada (brócoli, zanahoria, pimiento) asados con aceite de oliva.',
      cost_unit: 4.5,
      categories: ['Side Dishes', 'Vegan', 'Healthy', 'Keto'],
      extras: [{ name: 'Aderezo Balsámico', cost: 0.5 }],
      preview_img:
        'https://www.wellplated.com/wp-content/uploads/2021/12/What-to-do-with-roasted-vegetables.jpg',
    },
    {
      id_api: 'SD005',
      title: 'Onion Rings (Gourmet)',
      description:
        'Aros de cebolla grandes rebozados y crujientes, servidos con salsa signature BBQ ahumada.',
      cost_unit: 5.5,
      categories: ['Side Dishes', 'Comfort Food', 'Appetizers'],
      extras: [{ name: 'Salsa Extra', cost: 0.75 }],
      preview_img:
        'https://uppercrustent.com/uce-content/uploads/2013/11/Onion-Rings.jpg',
    },
    {
      id_api: 'SD006',
      title: 'Baked Mac & Cheese Side',
      description:
        'Porción más pequeña del cremoso y horneado Mac & Cheese de la casa.',
      cost_unit: 5.9,
      categories: ['Side Dishes', 'Comfort Food', 'Vegetarian'],
      extras: [{ name: 'Salsa Pesto', cost: 1.0 }],
      preview_img:
        'https://thesoulfoodpot.com/wp-content/uploads/2023/08/What-Goes-With-Mac-And-Cheese-scaled-e1691451400293.jpg',
    },
    {
      id_api: 'SD007',
      title: 'Chocolate Lava Cake',
      description:
        'Pequeño pastel de chocolate tibio con centro líquido de chocolate fundido.',
      cost_unit: 6.5,
      categories: ['Sweets', 'Dessert', 'Comfort Food'],
      extras: [{ name: 'Bola de Helado de Vainilla', cost: 2.0 }],
      preview_img:
        'https://images.getrecipekit.com/20250325120225-how-20to-20make-20chocolate-20molten-20lava-20cake-20in-20the-20microwave.png?width=650&quality=90&',
    },
    {
      id_api: 'SD008',
      title: 'Mini Crème Brûlée',
      description:
        'Postre de crema de vainilla con una capa de azúcar caramelizada crujiente.',
      cost_unit: 5.9,
      categories: ['Sweets', 'Dessert'],
      extras: [{ name: 'Frutos Rojos Frescos', cost: 1.5 }],
      preview_img:
        'https://pizzazzerie.com/wp-content/uploads/2021/04/Creme-Brulee-Cheesecakes28.jpg',
    },
    {
      id_api: 'SD009',
      title: 'Key Lime Pie Shot',
      description:
        'Porción individual en vaso pequeño, de tarta de lima ácida y dulce con graham cracker y crema batida.',
      cost_unit: 5.5,
      categories: ['Sweets', 'Dessert'],
      extras: [{ name: 'Ralladura de Lima Extra', cost: 0.25 }],
      preview_img:
        'https://www.berlyskitchen.com/wp-content/uploads/2024/05/Key-Lime-Pie-Shots-Featured-Image.jpg',
    },
    {
      id_api: 'SD010',
      title: 'Cookie of the Day',
      description:
        'Una galleta recién horneada del sabor del día (ej. chocolate, avena, maní).',
      cost_unit: 3.0,
      categories: ['Sweets', 'Dessert'],
      extras: [{ name: 'Leche Fría', cost: 1.5 }],
      preview_img:
        'https://www.foodandwine.com/thmb/4_UScMzHQCxZzACBITHHmT_EM3U=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Chocolate-Chunk-Halwah-Cookies-FT-RECIPE0923-1f8df755df6d468da98887aa846a2fe3.jpg',
    },
  ],
};
