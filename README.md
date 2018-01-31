# Приложение для создания и редактирования информации о встречах сотрудников

Написано для Node.js 8 и использует библиотеки:
* express
* sequelize
* graphql

## Задание
Код содержит ошибки разной степени критичности. Некоторых из них стилистические, а некоторые даже не позволят вам запустить приложение. Вам необходимо найти и исправить их.

Пункты для самопроверки:
1. Приложение должно успешно запускаться
2. Должно открываться GraphQL IDE - http://localhost:3000/graphql/
3. Все запросы на получение или изменения данных через graphql должны работать корректно. Все возможные запросы можно посмотреть в вкладке Docs в GraphQL IDE или в схеме (typeDefs.js)
4. Не должно быть лишнего кода
5. Все должно быть в едином codestyle

## Запуск
```
npm i
npm run dev
```

Для сброса данных в базе:
```
npm run reset-db
```

## Работа над багами
1)После скачивания репозитория я ознакомился с описанием в README.md . Передо мной достаточно стандартный проект на Node.js Возможные сценарии использования описаны в поле scripts у package.json

Первым делом я установил зависимости проекта - npm i Посмотрел что делает dev скрипт. - он просто вызывает index.js через нодедемон После чего запустил dev скрипт, и получил ошибку.

в sequelize.js -('Dialect needs to be explicitly supplied as of v4.0.0');

У ошибки весьма читаемое сообщение. Кажется при создании объекта не были указаны все необходимые параметры. Походил по зависимостям нашел конкретное место где шла речь о ‘new Sequelize’ , а именно в models/index.js . Но при вызове конструктора уже было указан dialect, здесь нужно проверить правильно ли он указан и достаточно ли такого объявления. После недолгих поисков по документации остановился на этом месте http://docs.sequelizejs.com/manual/installation/usage.html#dialects . Диалект указан правильно, инициализация в проекте и в примерах похожа. Но обратил внимание на то, что третьим параметром в new Sequelize идет password , а в проекты сразу конфигурационный объект, добавил в проект null третьим параметром, и проект собрался без ошибки.

2)Параллельно с работой на первой ошибкой. Решил запустить линтер он выдал ряд стилистических ошибок и одну ReferenceError. Автоматически исправил стилистические ошибки с помощью линтера . В ресолверах events поменял argumets на args.

3)Следуя описанию в README.md, я перешел по ссылке http://localhost:3000/graphql/ и получил ошибку Cannot GET /graphql. Стал смотреть в чем причина. Начал с роутов в index.js, и сразу нашел ошибку - опечатку в объявлении пути. Заменил graphgl на graphql, по ссылке стал открываться GraphQL IDE

      В GraphQL IDE первым делом решил проверить query, потом мутации.
4)Проверив различные запросы в GraphQL IDE, я обратил внимание на то, что у events в поля room и users приходили null’ы. В create-mock-data.js я уточнил, что каждому из создаваемых событий устанавливаются комнаты и участники. Значит и в запросах должны возвращаться не null. Ошибка могла быть в неверной инициализации либо в неверной обработке запросе. Меня смутила наличие у объекта events функция setRoom и setUser, так как эти функции в явном виде не объявляются в коде. Но изучив документацию на метод belongsToMany, понял, что наличие таких сеттеров может быть результатом использование Event.belongsToMany(User, { through: 'Events_Users' }). Все таки, возможно запрос обрабатывается не верно. Найдя место, где происходит обработка запроса, а именно ‘graphql/resolvers/query.js’ , а добавил такой отладочный код в метод event - “ models.Event.findById(id).then(elem => elem.getUsers()).then(console.log);”. Этот код производит поиск события, затем поиск участников и выводит участников в консоль. Попробовав запросить события через IDE, я увидел, что в консоль приходит информация о участниках этого события. Значи данные в базе лежат правильно. Я решил посмотреть, где еще в проекте используется метод getUsers. Оказалось, что такое место одни и это поле Event в resolvers. Бросилось в глаза, что функции users и room не возвращают результат своей работы. Заменим event.getUsers(); на return event.getUsers(); , я сделал новые запросы events в GraphQL IDE и на этот раз в поля room и users пришла правильная информация. Ошибка исправлена.

5)Проблема в запросом rooms: Комнаты возвращались с офсетом 1, т.е. в ответе на запрос не приходила первая комната. Убрал офсет, исправил первый параметр в models.Room.findAll на args.

Для однообразия в запросе users заменил первый аргумент models.User.findAll на args
Ошибки при обработке мутаций 7) Проверя все мутации обнаружил ошибку removeUserFromEvent - эта функция на возвращала значение и для установки нового номера комнаты использовался номер события, а не номер комнаты.

8)Для однообразия стиля кода заменил функции на стрелочные, там где это возможно
