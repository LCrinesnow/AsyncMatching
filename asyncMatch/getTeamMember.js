// function match
const Sequelize = require('sequelize');

function getTeamMember(sequelize){
   
   var teamMembers = sequelize.define('Team-Members', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      activityName: Sequelize.STRING(255),
      teamID: Sequelize.STRING(255),
      nickName:Sequelize.STRING(255),
      openId:Sequelize.STRING(10000),
      avatarUrl:Sequelize.STRING(10000),
      gender:Sequelize.INTEGER,
      Latitude: Sequelize.DOUBLE,
      Longitude: Sequelize.DOUBLE,
      address:Sequelize.STRING(1000),
      selectDate:Sequelize.STRING(10000),
      requestTime:Sequelize.DATE,
      timestamp:Sequelize.STRING(1000),
   }, {
      timestamps: false
      });
   
    var now = Date.now();
    var teamMember_res;

    return new Promise(function(resolve,reject){
	teamMember_res = teamMembers.findAll({
	   attributes: ['teamID','activityName','Latitude', 'Longitude','selectDate'],
	   where: {
	     activityName: 'Basketball'
	   }
        }).then(function(res){
		resolve(res)
	 }).catch(function (err) {
        console.log('failed: ' + err);
        teamMember_res=err;
        console.log(teamMember_res)
   	 });
    });

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

module.exports ={getTeamMember};
