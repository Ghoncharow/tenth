const Sequelize = require("sequelize");
const express = require("express");
const port = process.env.PORT || 8080;

// определяем объект Sequelize: database, username, password
const sequelize = new Sequelize("cmdineoz", "cmdineoz", "h8p4kgAX_PgYzdjMY1_R4XCuw_cyehdA", {
    dialect: "postgres",
    host: "raja.db.elephantsql.com",
    define: { timestamps: false }
});

// опреднляем модель данных
const Task = sequelize.define("task", {
    Id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
    Name: { type: Sequelize.STRING, allowNull: false },
    Time: { type: Sequelize.DOUBLE, allowNull: true },
    Done: { type: Sequelize.BOOLEAN, allowNull: true }
});
sequelize.sync().then(result=>{
    console.log('result1');
}).catch(err=> console.log(err));



// функция промежуточной обработки для предоставления статических файлов
const app = express();
app.use(express.static('static'));

// создаем парсер для данных в формате json
const jsonParser = express.json();

// удаление данных
app.delete("/tasks/:id", function(req, res){  
    const taskId = req.params.id;
    Task.destroy({where: {Id: taskId} }).then(() => {
        console.log('res7');
    }).catch(err=>console.log('err'));
});

// обновление данных в БД
app.put("/tasks/:id", jsonParser, function (req, res) {         
    if(!req.body) return res.sendStatus(400);
    const taskId = req.params.id;
    Task.update({Done: req.body.Done}, {where: {Id: taskId} }).then(() => {
        console.log('res8');
    }).catch(err=>console.log('err8'));
});

// получаем отредактированные данные и отправляем их в БД
app.post("/tasks", jsonParser, function (req, res) {         
    if(!req.body) return res.sendStatus(400);
    Task.create(req.body).then(()=>{
        console.log('res9');
    }).catch(err=>console.log('err9'));    
});

// Отправка данных на клиент
app.get('/tasks', function (req, res) {
    Task.findAll({raw:true}).then(tasks=>{
        res.json(tasks);
    }).catch(err=>console.log('err3'));
});

// выход из админки для владельца
app.use("/quit",function (req, res) { 
    console.log('Application is closing...');
    app.close;
    process.exit(0);
});

// постоянная переадресация
app.use("/:id",function (request, response) {
    const id = request.params.id;
    if (id!='') response.redirect("/");
});

// загрузка фронтенда в браузер
app.get("/", function(request, response){    
    response.sendFile(__dirname + "/static/index.html");     
});
  
app.listen(port, ()=>{console.log(`Сервер запущен по адресу http://localhost:${port}.`);});