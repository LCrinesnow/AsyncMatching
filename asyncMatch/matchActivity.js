//Activity match
const Sequelize = require('sequelize');                                        
const config = require('./config');
const ubilabs = require('./kdTree.js');

var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});
//in: 2 list(teams,pois) 
//use: kdTree
//out: 1 list  [{teamID:xxx,lat:xxx,log:xxx,count:x},{},{}...{}] x K places
function getObjListxK(teams,pois,ubilabs){
	var objListxK = {}
	var distance = function(a, b){
          return Math.pow(a.lat - b.lat, 2) +  Math.pow(a.log - b.log, 2);
        }
	//poiLoc list prepare
	var poiLocs = []
	for(let poi of pois){
	   var poiLoc ={
                lat:Number(poi.Latitude),
                log:Number(poi.Longitude),
		address:poi.address,
           }
	   //console.log("{lat:"+poiLoc.lat+",log:"+poiLoc.log+"},") 
	   poiLocs.push(poiLoc);
	}

	//build k,d Tree
	var tree = new ubilabs.kdTree(poiLocs, distance, ["lat", "log"]);
	//query with teams
	var res = []
	for(let team of teams){
		//console.log(team)
		var nearest = tree.nearest({lat:team.commonLatitude,log:team.commonLongitude}, 5);//k=5
		//console.log(nearest);
		for (let near of nearest){
		  var temp = {
			teamID:team.teamID,
			lat:near[0].lat,
			log:near[0].log,
			add:near[0].address,
			count:team.count,
		  }
		  console.log(near[0])
		  res.push(temp);
		}
	}
	return res;
}
//in :objListxK list
//out : map of (location ===> teamID1,teamID2...)
function generateVote(objListxK){
 
  var vote = new Map();

  //mapping value:teamID to key:"lat:xxx,log:xxx"
  for(let ele of objListxK){
        var key = 'lat:'+ele.lat +',log:'+ele.log+',address:'+ele.add;
        var thisEleInfo = ele.teamID + 'cnt:'+ele.count
        if(vote.has(key)){
            var value = vote.get(key)
            value.push(thisEleInfo)
            vote.set(key,value)
        }else{
            vote.set(key,[thisEleInfo])
        }
  }
  return vote
}
//count how many people an Activity location have.
//in : all teams in one location
//out : this location has "count" people
function countPeople(teams){
    var count = 0
    for(let team of teams){
	count = Number(team.split("cnt:")[1])+count;
    }
    return count;
}
//delete the teams of that location
//in : vote
//out: activityToStore -> the deleted teams and its Location. Ready for storage.
function getMaxPplLocAndDelItsTeams(vote){
  var maxPplLoc=getMaxPplLoc(vote)
   
 // var list = maxPplLoc.split(",")  //list[]-> lat:xx,log:xx,add:xx,team1:2,team2:2,team3:3...(teams and numbers starts from list[3])
  var objarray = list2array(maxPplLoc)

  var matchedTeams = []
 //console.log('maxPplLoc'+maxPplLoc+"RS"+countPeople(maxPplLoc[1]))
  /////var unMatchedTeams = deleteTeams(matchedTeams,vote)
  var unMatchedTeams = deleteTeams(maxPplLoc,vote)

  return [maxPplLoc,unMatchedTeams]
  /////return [matchedTeams,unMatchedTeams]
}
//function:regulate the teams into a particular number. eg:location:19 people, subtract it to 9 for basketball
//in: list of teams that where not matched in numbers.
//out: matchedTeams
function match(list){
  var matchedTeams = []
    
  
  return matchedTeams
}

//function:turn list into a object array  [team1:1,team2:3,team3:2....]
//in: list
//out:object array
function list2array(list){
  console.log(1111111111111)
  var objarray = []
  for(let i=3;i<list.length;i++){
    var temp = list[i].split(":")
    var ele = {
 	id:temp[0],
	num:temp[1]
    }
    objarray.push(ele)
  }
  console.log("print objarray:"+JSON.stringify(objarray))
  return objarray
}



//function:delete maxPplLoc in the vote pool(map)
//in:maxPplLoc and vote pool(map)
//out:vote pool that have been deleted maxPplLoc
function deleteTeams(maxPplLoc,vote){
 var teams2Delete = maxPplLoc[1] //[team1,team2...] 
  console.log('teams2Delete:'+teams2Delete)
  //deleting matched Teams in voting map.
  for(let v of vote){
    console.log('before:'+v[1])
    for(let dt of teams2Delete){
        if(v[1].indexOf(String(dt))!==-1){
            var i =v[1].indexOf(String(dt))
            v[1].splice(i,1);
        }else{
           continue;
        }
    //console.log('deleteTeams:'+deleteTeams)
    }
    console.log('after:'+v[1])
  }
  return vote
}
//function:get the Location with Max people
//in:vote map in this round
//out:the Location with the most amount of people.
function getMaxPplLoc(vote){
  var maxPplLoc=[]
  for(let v of vote){
    console.log(v+"RS:"+countPeople(v[1]))
    // deep copy v to maxPplLoc by stringify and parse
    if(JSON.stringify(maxPplLoc)==='[]'){
       maxPplLoc = JSON.parse(JSON.stringify(v))
    }else if(countPeople(maxPplLoc[1])<countPeople(v[1])){
       maxPplLoc = JSON.parse(JSON.stringify(v))
    }else{
       continue;
    }
  }
  return maxPplLoc
}

// in: 2 list(teams,pois) 
// flow: getObjListxK ->vote by location ->recursively remove teamID
// out: map
function matchActivity(teams,pois){
   
  var objListxK = getObjListxK(teams,pois,ubilabs)
  var vote = generateVote(objListxK)
  console.log(vote)
  var res = getMaxPplLocAndDelItsTeams(vote);
  var act2Store = res[0]
  vote = res[1]
  console.log('act2Store:'+act2Store)
  console.log('vote:'+vote)
}

function storeActivity(act2Store){

   var line = sequelize.define('Teams', {
      activityID: {
        type: Sequelize.STRING(255),
        primaryKey: true
      },
      activityName: Sequelize.STRING(255),
      teamID: Sequelize.STRING(100000),
      activityPlace: Sequelize.STRING(255),
      commonLatitude: Sequelize.DOUBLE,
      commonLongitude: Sequelize.DOUBLE,
   }, {
      timestamps: false
      });
    
    //parse act2Store
    var info = act2Store.split(","); 
    //var lat = (Number)info[0]
    //var log = (Number)info[1]
    //var address = info[2].split("address:")[1]
    



    //parse act2Store 
    var now = Date.now();
    (async () => {
 
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

    })(); 
}



module.exports ={ matchActivity };


