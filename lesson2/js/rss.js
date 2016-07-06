var indexedDB 	  = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
IDBTransaction  = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction,
baseName 	  = "filesBase",
storeName 	  = "filesStore2";
var WEBSQL = true;


$(document).ready( function() {
	$('#db_find_go').click(function() {
		var $output = $('#db_find_result')
		var db = openDatabase('fts_demo', 1, 'fts_demo', 5000000);

		db.transaction(function (tx){
		  function onReady() {
		    var content = 'WebSQL has full-text search!';
		    $output.append('\nText is: "' + content + '"');
		    tx.executeSql('insert into doc values (?)', [content], function () {
		      var terms = ['websql', 'text', 'search', 'searches', 'searching', 'indexeddb']
		      terms.forEach(function (term) {
		        tx.executeSql('select count(*) as count from doc where content match ?',
		            [term], function (tx, res) {
		          var count = res.rows.item(0).count;
		          $output.append('\nTerm "' + term + '" matches: ' + !!count);
		        });  
		      });
		    });
		  }
		  tx.executeSql('create virtual table doc using fts3(content text, tokenize=porter);', [], onReady, onReady);
		});
	});
});

function getFeed() {
	var HOST = 'http://www.3dnews.ru/news/rss/';
	
	$(document).ready( function() {
		$.ajax({
			type: 'GET',
			url: HOST,
			dataType: 'xml',
			success: xmlParse,
			error: ajaxError
		});
		
		console.log($('#db_find_go'));

		$('#db_find_go').click(function() {
			var $output = $('#db_find_result');
			console.log('asd');
		});
	});
	function xmlParse(xml) {
		clearDB();
		$('#rssContent').text('');
		var arr = [];
		var cnt = 0;
		$(xml).find('item').each(function() {
			var obj = addItem($(this).find('enclosure').attr('url'),
					$(this).find('title').text(),
					$(this).find('description').text());
			arr.push(obj);
			if (WEBSQL)
				wSetData(obj);
			else
				setData(obj);
			cnt++;
		});
		console.log(cnt);
	}
	function ajaxError(e) {
		function adder(res) {
			function getter(v, i) {
				if (WEBSQL)
					return v[i];
				else
					return v[i];
			}
			for (var item in res) {
				var img, title, descr;
				for (var itemP in (value = res[item])) {
					switch(itemP) {
					case 'img':
						img = getter(value, itemP);
						break;
					case 'title':
						title = getter(value, itemP);
						break;
					case 'descr':
						descr = getter(value, itemP);
					}
				}
				addItem(img, title, descr);
			}
		}
		if (WEBSQL)
			wGetData(adder);
		else
			getStorage(adder);
	}
	
	function addItem(imgg, title, descr) {
		var img = document.createElement('img');
		img.src = imgg;
		img.style.width = '100%';
		var divImg = document.createElement('div');
		divImg.class = 'feedImage';
		divImg.appendChild(img);
		var divTitle = document.createElement('div');
		divTitle.class = 'feedTitle';
		divTitle.style.fontWeight = 'bold';
		divTitle.innerHTML = title;
		var divDescr = document.createElement('div');
		divDescr.class = 'feedDescr';
		divDescr.innerHTML = descr;
		var item = document.createElement('div');
		item.class = 'feedItem';
		item.appendChild(divImg);
		item.appendChild(divTitle);
		item.appendChild(divDescr);
		$('#rssContent').append(item);
		return {img: imgg, title: title, descr: descr};
	}
}
function clearDB() {
	if (WEBSQL)
		wClearStorage();
	else
		clearStorage();
}





function wSetData(o) {
	var connect = window.openDatabase(baseName, "1.0", "myDB", 200000);
	connect.transaction(function(db) {
		//Асинхронно
		db.executeSql("CREATE TABLE IF NOT EXISTS "+ storeName +" (id INTEGER PRIMARY KEY AUTOINCREMENT, img TEXT, title TEXT, descr TEXT)", [], null, null);
		db.executeSql("INSERT INTO "+ storeName +" (title, descr, img) VALUES (?, ?, ?)", [o.title, o.descr, o.img], null, null);
	}); 
}
function wGetData(f) {
	var connect = window.openDatabase(baseName, "1.0", "myDB", 200000);
	var res;
	console.log(res);
	connect.transaction(function(db) {
		db.executeSql('SELECT * FROM '+ storeName, [], function (db, results) {
		      f(results.rows);
		   }, null);
	});
}
function wClearStorage() {
	var connect = window.openDatabase(baseName, "1.0", "myDB", 200000);
	connect.transaction(function(db) {
		//Асинхронно
		db.executeSql("DELETE FROM " + storeName, [], null, function(e) {console.log(e);});
	});
}








function logerr(err){
	console.log(err);
}

function connectDB(f){
	var request = indexedDB.open(baseName, 1);
	request.onerror = logerr;
	request.onsuccess = function(){
		f(request.result);
	}
	request.onupgradeneeded = function(e){
		var objectStore = e.currentTarget.result.createObjectStore(storeName, { autoIncrement: true });
		connectDB(f);
	}
}

function getData(key, f){
	connectDB(function(db){
		var request = db.transaction([storeName], "readonly").objectStore(storeName).get(key);
		request.onerror = logerr;
		request.onsuccess = function(){
			f(request.result ? request.result : -1);
		}
	});
}

function getStorage(f){
	connectDB(function(db){
		var rows = [],
			store = db.transaction([storeName], "readonly").objectStore(storeName);

		if(store.mozGetAll)
			store.mozGetAll().onsuccess = function(e){
				f(e.target.result);
			};
		else
			store.openCursor().onsuccess = function(e) {
				var cursor = e.target.result;
				if(cursor){
					rows.push(cursor.value);
					cursor.continue();
				}
				else {
					f(rows);
				}
			};
	});
}

function setData(obj){
	connectDB(function(db){
		var request = db.transaction([storeName], "readwrite").objectStore(storeName).add(obj);
		request.onerror = logerr;
		request.onsuccess = function(){
			return request.result;
		}
	});
}

function delData(key){
	connectDB(function(db){
		var request = db.transaction([storeName], "readwrite").objectStore(storeName).delete(key);
		request.onerror = logerr;
		request.onsuccess = function(){
			console.log("File delete from DB:", file);
		}
	});
}

function clearStorage(){
	connectDB(function(db){
		var request = db.transaction([storeName], "readwrite").objectStore(storeName).clear();
		request.onerror = logerr;
		request.onsuccess = function(){
			console.log("Clear");
		}
	});
}


