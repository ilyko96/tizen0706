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
	});
	function xmlParse(xml) {
		$('#rssContent').text('');
		var arr = [];
		$(xml).find('item').each(function() {
			var img = document.createElement('img');
			img.src = $(this).find('enclosure').attr('url');
			img.style.width = '100%';
			var divImg = document.createElement('div');
			divImg.class = 'feedImage';
			divImg.appendChild(img);
			var divTitle = document.createElement('div');
			divTitle.class = 'feedTitle';
			divTitle.style.fontWeight = 'bold';
			divTitle.innerHTML = $(this).find('title').text();
			var divDescr = document.createElement('div');
			divDescr.class = 'feedDescr';
			divDescr.innerHTML = $(this).find('description').text();
			var item = document.createElement('div');
			item.class = 'feedItem';
			item.appendChild(divImg);
			item.appendChild(divTitle);
			item.appendChild(divDescr);
			$('#rssContent').append(item);
			addItem($(this).find('enclosure').attr('url'),
					$(this).find('title').text(),
					$(this).find('description').text());
			
			var obj = {
					img: img.src,
					title: divTitle.innerHTML,
					descr: divDescr.innerHTML
				};
			arr.push(obj);
			setData(obj);
		});
	}
	function ajaxError(e) {
		getStorage(function(res) {
			for (var item in res) {
				var img, title, descr;
				for (var itemP in (value = res[item])) {
					switch(itemP) {
					case 'img':
						img = value[itemP];
						break;
					case 'title':
						title = value[itemP];
						break;
					default:
						descr = value[itemP];
					}
					addItem(img, title, descr);
				}
			}
		})
	}
	function addItem(img, title, descr) {
		var img = document.createElement('img');
		img.src = img;
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
	}
}
function clearDB() {
	clearStorage();
}






var indexedDB 	  = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
IDBTransaction  = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction,
baseName 	  = "filesBase",
storeName 	  = "filesStore";




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


