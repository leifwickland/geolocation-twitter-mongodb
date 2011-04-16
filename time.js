print("Input count: " + db.tweets.find().count());


var mappers = {
  Minutes: function() { 
             function pad(n){return n<10 ? '0' + n : n}
             var d = new Date(this.created_at);
             var key = d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes())+':'+pad(0)+'Z';
             emit(key, 1);
           },

  Hours: function() { 
           function pad(n){return n<10 ? '0' + n : n}
           var d = new Date(this.created_at);
           var key = d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+':'+pad(0)+':'+pad(0)+'Z';
           emit(key, 1);
         },

  Days: function() { 
          function pad(n){return n<10 ? '0' + n : n}
          var d = new Date(this.created_at);
          var key = d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())+'T'+pad(0)+':'+pad(0)+':'+pad(0)+'Z';
          emit(key, 1);
        },
};

var reduce = function(key, values) {
  var sum = 0;

  for (var i = 0; i < values.length; ++i) {
    sum += values[i];
  }

  return sum;
};

[ "Minutes", "Hours", "Days" ].forEach(function(resolution) {
  print("Working on " + resolution);
  var collectionName = "tweetsBy" + resolution;
  if (db[collectionName]) {
    print("Dropping " + collectionName);
    db[collectionName].drop();
  }
  print("Creating " + collectionName);
  db.createCollection(collectionName);
  print("Starting to map tweets to " + collectionName);
  db.tweets.mapReduce(mappers[resolution], reduce, collectionName);
  print("Done mapping tweets to " + collectionName);
  print("Output count: " + db[collectionName].count());
});

