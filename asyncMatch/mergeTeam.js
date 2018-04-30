//Team merge
const Sequelize = require('sequelize');                                                   
const config = require('./config');
geolib = require('geolib')

var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});

function mergeTeam(sqlRes){
  var teamsMap=new Map();
  
  for(var line of sqlRes){ 
    var loc = {
	selectDate:line.selectDate,
        activityName:line.activityName,
	Latitude:line.Latitude,
	Longitude:line.Longitude
    }
    //console.log(line)
    if(teamsMap.has(line.teamID)){ // if already in team
      var curLoc=teamsMap.get(line.teamID);
      curLoc.push(loc);
      teamsMap.set(line.teamID,curLoc) 
    }else{
       teamsMap.set(line.teamID,[loc])
    }
  }
  console.log(teamsMap);
  storeTeam(teamsMap);
  
}

function storeTeam(teamsMap){

   var teams = sequelize.define('Teams', {
      teamID: {
        type: Sequelize.STRING(255),
        primaryKey: true
      },
      activityName: Sequelize.STRING(255),
      activityID: Sequelize.STRING(255),
      commonLatitude: Sequelize.DOUBLE,
      commonLongitude: Sequelize.DOUBLE,
      selectDate:Sequelize.STRING(255),
      calculateTime:Sequelize.DATE,
      count:Sequelize.INTEGER, 
   }, {
      timestamps: false
      });
    
    var now = Date.now();
    (async () => {
 
	for(let map of teamsMap){
		console.log(map[0]+'==='+map[1])
		var spots = []
		for(let person of map[1]){
			var spot ={
				latitude:person.Latitude,
				longitude:person.Longitude
			}
			spots.push(spot);
			//console.log(person)			
		}
		var center = geolib.getCenter(spots);
		console.log(center)

		var inserted= await teams.create({
          		teamID: map[0],
         		 activityName: map[1][0].activityName,
         		 activityID: '',
          		 commonLatitude: center.latitude,
         		 commonLongitude: center.longitude,
         		 selectDate:map[1][0].selectDate,
         		 calculateTime:now,
         		 count:spots.length, 
        	});
		console.log('created: ' + JSON.stringify(inserted));
	}

     })(); 
}



module.exports ={ mergeTeam };


