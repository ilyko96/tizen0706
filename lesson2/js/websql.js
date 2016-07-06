$(document).ready(function() {
	$('#select-choice-1').change(function() {
		$('[data-role="page"]').attr('data-theme', 'b');
		console.log($('[data-role="page"]').attr('data-theme'));
		//$('[data-role="page"]').attr('data-theme', $('#select-choice-1 option:selected').val());
	});
});