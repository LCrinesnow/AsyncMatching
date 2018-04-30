var CronJob = require('cron').CronJob;
const Sequelize = require('sequelize');
const config = require('./config');
getTeamMember = require('./getTeamMember');
mergeTeam = require('./mergeTeam');
getPOIs_Teams = require('./getPOIs_Teams');
matchActivity = require('./matchActivity');

var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});

/*getTeamMember.getTeamMember(sequelize).then(function onFulfilled(value){
    mergeTeam.mergeTeam(JSON.parse(JSON.stringify(value))); //value is a Promise result, after stringify turns to a string array, parse it back to array      
//	for (var line of JSON.parse(JSON.stringify(value))){
//	   console.log(line)
//	}
    console.log("xxx:"+JSON.stringify(value))
}).catch(function onRejected(error){
    console.error(error);
});
//ADD A TIMEOUT!!!!ASYNC!!!!
*/
getPOIs_Teams.getPOIs_Teams(sequelize).then(function onFulfilled(value){
	var teams;
	var pois;
	teams = JSON.parse(JSON.stringify(value))[0]
        pois = JSON.parse(JSON.stringify(value))[1]  
        
	for(let team of teams){
		console.log(team)
	}
	for(let poi of pois){
		console.log(poi) 
	}
	console.log('getPOIs_Teams 0')
	matchActivity.matchActivity(teams,pois);
	
	//console.log(JSON.stringify(value))
}).catch(function onRejected(error){
    console.error(error);
});

//matchActivity.matchActivity(teams,pois)


var activity_basketball = sequelize.define('Activity', {
    activityID: {
        type: Sequelize.STRING(255),
        primaryKey: true
    },
    
    activityName: Sequelize.STRING(255),
    activityTime: Sequelize.STRING(255),
    activityPlace: Sequelize.STRING(255),
}, {
        timestamps: false
    });

console.log("???")
/*new CronJob('* * * * * *', function() {
  console.log('You will see this message every second');
  
  var now = Date.now();

  (async () => {
    var a_b = await activity_basketball.create({
        activityID:'activityID-' + now,
        activityName: 'Odie',
        activityTime:false,
        activityPlace: '2008-08-08',
	timestamps: true,
    });
    console.log('created: ' + JSON.stringify(a_b));
  })();

}, null, true, 'America/Los_Angeles');  */
