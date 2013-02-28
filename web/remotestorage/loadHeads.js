window.onload = function() {
    var headContainer = document.getElementById('heads');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'heads.json');
    xhr.onload = function() {
	var heads = JSON.parse(xhr.responseText);
	heads.forEach(function(head) {
	    var item = document.createElement('li');
	    var link = document.createElement('a');
	    link.innerHTML = head;
	    link.setAttribute('href', 'heads/' + head);
	    item.appendChild(link);
	    headContainer.appendChild(item);
	});
    };
    xhr.send();
};
