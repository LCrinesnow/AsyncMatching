// function: get POIs and Teams from MySQL 
// and return both in "bothres"
// in: nothing
// out: POIs and Teams arrays
const Sequelize = require('sequelize');

function getPOIs_Teams(sequelize){
   
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
    var teams_res;
    var bothres = [];
  
    return new Promise(function(resolve,reject){
	teams_res = teams.findAll({
	   attributes: ['teamID','activityName','commonLatitude', 'commonLongitude','selectDate','count'],
	   where: {
	     activityName: 'Basketball'
	   }
        }).then(function(res){
	    //promise
	    getPOIs(sequelize,bothres).then(function onFulfilled(value){
		//console.log(JSON.stringify(value)+"getPOIs 2")
		resolve(value) //resolve out to getPOIs_Teams 0
	    }).catch(function onRejected(error){
    		console.error(error);
	    });
  	    //promise
	    bothres.push(res);
	    console.log('getPOIs_Teams 1')
	    //console.log(JSON.stringify(bothres))
        }).catch(function (err) {
        console.log('failed: ' + err);
        teams_res=err;
        console.log(teams_res)
        });	
    });

function getPOIs(sequelize,bothres){

   var pois = sequelize.define('POIs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      activityName: Sequelize.STRING(255),
      city: Sequelize.STRING(255),
      region:Sequelize.STRING(255),
      name:Sequelize.STRING(10000),
      address:Sequelize.STRING(10000),
      type:Sequelize.INTEGER,
      Latitude: Sequelize.DOUBLE,
      Longitude: Sequelize.DOUBLE,
      telephone:Sequelize.STRING(255),
   }, {
      timestamps: false
      });

	var pois_res;
	return new Promise(function(resolve,reject){
                //begin call back
                pois_res = pois.findAll({
                attributes: ['name','Latitude','Longitude','activityName','address'],
                    where: {
                       activityName: 'Basketball',
                       type:'indoor',
                    //city:"Beijing"
                    }
                }).then(function(res){
                    //console.log(JSON.stringify(res))
		    	bothres.push(res)
		     	resolve(bothres) 
                }).catch(function (err) {
                        console.log('failed: ' + err);
                        pois_res=err;
                        console.log(pois_res)
                 });
                //end call back
            });
}

/*

    (async () => {
        teamMember_res = await teamMembers.findAll({
 	  attributes: ['teamID','openId','Latitude', 'Longitude'],
	  where: {
            activityName: 'Basketball'
          }
	});
    for(var line of teamMember_res){
      console.log(JSON.stringify(line))
      res.push(line)
    }
    console.log('created: ' + JSON.stringify(teamMember_res));
  })();*/
}

module.exports ={getPOIs_Teams};
