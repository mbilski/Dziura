function mapTable() {
	this.aa = function(){
		initialize();
		  $('#example tbody tr ').live( 'click', function () {
		        
		        var id = $(this).html();
		        id = id.substr(id.indexOf(">")+1);
		        id = id.substr(0,id.indexOf("<"));
		        
		    } );
	}
	
	this.setHihglightRow = function (issue_id){
		$('#example tbody tr ').each(function() {
			var id = $(this).html();
	        id = id.substr(id.indexOf(">")+1);
	        id = id.substr(0,id.indexOf("<"));
	        if (id==issue_id) {
	        	$(this).toggleClass('ui-state-hover');
	        }
		});
	}
}