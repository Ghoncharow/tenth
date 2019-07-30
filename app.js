Ext.application({
    name: 'MVVM',
    launch: function() {
      
        // инициализация функционала всплывающих подсказок
        Ext.tip.QuickTipManager.init();
        Ext.widget({
            xtype: 'viewport',
            renderTo: Ext.getBody(),
            layout: 'fit',
            items: [{
                xtype: 'tabpanel',
                activeTab: 0,
                layout: 'fit',
                items: [{
                    xtype: 'panel',
                    title: 'Список задач',
                    autoScroll: true,
                    html: `<div id="myDIV" class="header">
                            <h2 style="margin-bottom: 20px">Список задач ToDoList</h2>
                            <input type="text" id="myInput" placeholder="Напечатайте пожалуйста свою задачу здесь">
                            <span id="newElement" class="addBtn">Добавить</span>
                            </div>

                            <ul id="myUL">
                            </ul>
                            <br><br><br>
                            <article style="margin: 0 auto; width: 900px;"></article>
                            <br><br><br>`,                    
                    tabConfig: {
                          //всплывающая подсказка
                          tooltip: {
                              title: 'Мое первое приложение на Ext JS 6',
                              text: 'Congratulations! ExtJS App is working!!!'
                          }
                      }
                }, {
                    xtype: 'panel',
                    title: 'Гистограмма выполнения',
                    autoScroll: true,
                    tabConfig: {
                          //всплывающая подсказка
                          tooltip: {
                              title: 'Мое первое приложение на Ext JS 6',
                              text: 'Congratulations! ExtJS App is working!!!'
                          }
                    }
                }]
            }]
 
        });
 

        Ext.Ajax.request({
          url: '/tasks',
          success: function(response, options){
            // декодируем полученные json-объекты  
            var tasks = Ext.decode(response.responseText); 
      
            // сортируем полученные json-объекты
            Ext.tasks = tasks.sort(function(obj1, obj2) {
              if (obj1.Name < obj2.Name) return -1;
              if (obj1.Name > obj2.Name) return 1;
              return 0;
            }).slice();            
      
            for (let task of tasks) {
              let li = document.createElement("li");
              li.innerText = task.Name;
              document.getElementById("myUL").appendChild(li);
              let span = document.createElement("SPAN");
              let txt = document.createTextNode("\u00D7");
              span.className = "close";
              span.appendChild(txt);
              li.appendChild(span);
              if (task.Done) li.classList.add('checked');
              
            }
          },
          failure: function(response, options){
            alert('Запрос на сервер не удалось выполнить.');
          }
        });
      
      
        // Create a new list item when clicking on the "Add" button     
        var xhr = new XMLHttpRequest();
        var element = Ext.get('newElement');
            element.on('click', function(){            
                var li = document.createElement("li");
                var inputValue = document.getElementById("myInput").value.trim();
                var t = document.createTextNode(inputValue);
                li.appendChild(t);
                if (inputValue === '') {
                  alert("Необходимо ввести нужную вам задачу!");
                } else {
                  let time = parseFloat(prompt("Введите время выполнения задачи до 100 часов."));
                  time = time ? Math.abs(time) : 100*Math.random();
                  document.getElementById("myUL").appendChild(li);
                  let id = 1 + Math.max(...Ext.tasks.map(a=>a.Id));
                  let json = { Id: id, Name: inputValue, Time: time, Done: false };
                  let jsonb = JSON.stringify(json);
                  Ext.tasks.push(json);
                  xhr.open("POST", "/tasks", true);
                  xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
                  xhr.send(jsonb);
                }
                document.getElementById("myInput").value = "";
              
                var span = document.createElement("SPAN");
                var txt = document.createTextNode("\u00D7");
                span.className = "close";
                span.appendChild(txt);
                li.appendChild(span);               
      
            }, this);
            
            // Add a "checked" symbol when clicking on a list item
            var list = document.querySelector('ul');
            list.addEventListener('click', function(ev) {
              if (ev.target.tagName === 'LI') {
                ev.target.classList.toggle('checked');
              }
            }, true);
      
            document.getElementsByTagName("ul")[0].onclick = function(e) {
              var target = e ? e.target : event.srcElement;
              while (target != this && target.nodeName.toLowerCase() != "li") {
                  target = target.parentNode;
              }
              if (target == this) { return; }
              var index = 0;
              while (target = target.previousSibling) {
                  if (target.nodeType === 1) {
                      index++;
                  }
              }
              
              var idx = Ext.tasks[index].Id;
              if (e.target.className === 'close'){
                xhr.open("DELETE", "/tasks/"+idx, true);
                Ext.tasks.splice(index, 1);
                xhr.send(null);
                list.removeChild(e.target.parentNode);
                let elem = document.getElementById('bar'+idx);
                elem.parentNode.removeChild(elem);
              } else {
                Ext.tasks[index].Done = !Ext.tasks[index].Done;
                let json = JSON.stringify(Ext.tasks[index]);
                xhr.open("PUT", "/tasks/"+idx, true);
                xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
                xhr.send(json);
              }
            };

            // Include our script that will make our bar chart
            var x = 0;
            var chart_area =
            d3.select("article")   // Выборка состоит из элемента <article>
                .append('div')    // Выборка состоит из вновь созданного элемента <div>
                .classed('chart_area', true); // Задаем класс выбранному элементу <div class='chart_area'></div>

        document.getElementById("myUL").addEventListener("DOMSubtreeModified", function() {
              
            // Берем предыдущую выборку элементов (хранящуюся в переменной chart_area)
            chart_area
            // Делаем выборку всех дочерних элементов <div> из текущей выборки;
            // на данный момент таких элементов нет, и эта выборка пока пуста
            .selectAll('div')
            // Связываем выборку с массивом данных
            .data(Ext.tasks)
            // Из всего множества элементов выделяем подмножество добавляемых элементов 'enter';
            // в данном случае это элементы, соответствующие всем элементам массива
            .enter()
            // Добавляем новые элементы <div> </div>
            .append('div')
            // Задаем класс выбранным элементам class='bar_area'
            .classed('bar_area', true).attr("id", function (d) {return 'bar' + d.Id;})
            .style('background-color', 'hsl(240,50%,75%)')
            .style('height', '25px')
            .style('margin', '5px 0px')
            // Задаем стиль width='<d>px', где d — значение элемента массива
            .style('width', 0) // Исходная ширина элемента до начала анимации
            .transition()
            .duration(8000)     // Продолжительность анимации в миллисекундах
            .style('width', function (d) { return (d.Time * 9) + 'px';})
            // Задаем строковое значение равным значению элемента массива
            .text(function (d) {return d.Name+': '+d.Time+' ч.';})
            .style('white-space', 'nowrap')
            .style('background-color', 'lightblue');            

        });
        
    }
});


