function getFeed() {
	var HOST = 'http://www.3dnews.ru/news/rss/';
	
	$(document).ready( function() {
		$.ajax({
			type: 'GET',
			url: HOST,
			dataType: 'xml',
			success: xmlParse
		});
	});
	function xmlParse(xml) {
		$('#rssContent').text('');
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
		});
	}
}