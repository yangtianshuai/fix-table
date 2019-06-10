/*
************************************************************
作者：YTS
版本：1.0.1
日期：2018-6-3
************************************************************
*/
var Table = function (opt) {
	this.showheader = true;
	this.columns = [];
	this.rows = [];
	this.id = opt.id;
	this.across = true;
	this.showBorder = true;
	this.multiHeader=false;	
	if(opt.multi){
		this.multiHeader=opt.multi;	
	}
	//显示单元格边框
	this.showLine = opt.showLine;
	if (opt.across != undefined) {
		this.across = opt.across;
	}
	if (opt.container == undefined && opt.id) {
		opt.container = $('#' + this.id).parent();
	}
	this.container = opt.container;
	if (this.container) {
		if (this.container.find('#' + this.id + ' .table_header thead').length == 0) {
			this.init();
		} else {
			this.initHeader(); //初始化列头
		}
		this.head = this.container.find('#' + this.id + ' .table_header thead');
		this.body = this.container.find('#' + this.id + ' .table_body tbody');
		if (this.showLine) {
			this.container.find('#' + this.id + ' .table_body').css('border-width',0);					
		}
		if (opt.border != undefined && !opt.border) {
			this.container.find('#' + this.id + ' .table_header').css('border', '0');
			this.container.find('#' + this.id + ' .table_body').css('border', '0');
			for (var i = 0; i < this.head.find('tr').length; i++) {
				this.head.find('tr').eq(i).find('th').eq(
					this.head.find('tr').eq(i).find('th').length - 1).addClass('last');
			}
		}
		//this.setSize();
	}
	this.container.find('#' + this.id + ' .table_body').hide();	
	//选中行坐标
	this.selectedIndex = -1;
	this.selectedRowChange = opt.selectedRowChange;
}

Table.prototype = {
	init: function () {
		if (this.container.find('#' + this.id).length == 0) {
			this.container.append('<div id="' + this.id + '">' + '</div>');
			this.container.find('#' + this.id).append('<div class="table_header"><table class="gridtable"><thead></thead></table></div>');
			this.container.find('#' + this.id).append('<div class="table_body"><table class="gridtable"><tbody></tbody></table></div>');
		} else {
			if (this.columns.length > 0) {
				return;
			}
			var html = $('#' + this.id).html();
			if (html.indexOf('thead') < 0) {
				html = '<thead>' + html + '</thead>';
			}
			html = '<div class="table_header"><table class="gridtable">' + html + '</table></div>'
			html += '<div class="table_body"><table class="gridtable"><tbody></tbody></table></div>';
			html = '<div id="' + this.id + '">' + html + '</div>';
			$('#' + this.id).after(html);
			$('#' + this.id).eq(0).remove();
			this.initHeader(); //初始化列头
		}
	},
	initHeader: function () {
		var headRows = this.container.find('#' + this.id + ' .table_header thead tr');
		if (headRows.length == 1) {
			var ths = headRows.eq(0).children();
			var width = this.container.find('#' + this.id + ' .table_header table').width();
			for (var i = 0; i < ths.length; i++) {				
				var column={
					name: ths.eq(i).attr('name'),
					type: ths.eq(i).attr('type'), //类别
					sort: ths.eq(i).attr('sort'), //列排序					
					minWidth: ths.eq(i).css('min-width'),
					position: ths.eq(i).css('text-align'),
					visible: ths.eq(i).css('display') != 'none',
					title: ths.eq(i).text()
				};
				if(ths.eq(i).style && ths.eq(i).style.width){
					column.width = ths.eq(i).style.width;
				}else{
					column.width=(ths.eq(i).width() * 100 / width).toFixed(6);
				}
				this.addHeader(column);
			}
		}
	},
	addHeader: function (column) {
		var index = this.columns.length;
		this.columns.push(column);
		if (!this.head) return;
		if (this.head.find('tr').length == 0) {
			this.head.append('<tr></tr>');
		}
		var html = '<th name="' + this.columns[index].name + '"';
		html += '>';
		if (this.columns[index].title) {
			html += this.columns[index].title;
		}
		if (this.columns[index].sort) {
			this.columns[index].sort = 'asc';
			html += '<div class="sort"></div>';
		}
		html += '</th>';
		this.head.find('tr').append(html);
		var th = this.head.find('tr th').eq(index);
		//设置隐藏
		if (this.columns[index].visible == undefined) {
			this.columns[index].visible = true;
		}
		if (!this.columns[index].visible) th.hide();
		//设置列排序
		if (this.columns[index].sort) {
			th.click(function () {
				//
			});
		}
		//设置列宽度
		if (this.columns[index].width) {
			if (this.columns[index].unit) {
				th.css('width', this.columns[index].width + this.columns[index].unit);
			} else {
				if ((this.columns[index].width + '').indexOf('%') >= 0) {
					th.css('width', this.columns[index].width);
				} else {
					th.css('width', this.columns[index].width + '%');
				}
			}
		}
		//设置最小宽度
		if (this.columns[index].minWidth) {
			if (this.columns[index].unit) {
				th.css('min-width', this.columns[index].minWidth + this.columns[index].unit);
			} else {
				th.css('min-width', this.columns[index].minWidth);
			}
		}
		//设置相对位置
		if (this.columns[index].position == undefined) {
			this.columns[index].position = 'center';
		}
		th.css('text-align', this.columns[index].position);
	},
	//设置列头
	setHeader: function (columns, header) {
        this.head.empty();
        if (this.multiHeader) {
            this.container.find('#' + this.id + ' .table_body table thead').remove();
            this.container.find('#' + this.id + ' .table_header').show();
        }
		if (!header) {
			this.columns = [];
			for (var i = 0; i < columns.length; i++) {
				this.addHeader(columns[i]);
			}
            this.setSize();
            this.rows = [];
		} else {
			this.multiHeader=true;
			this.columns = columns;
			this.head.append(header);
			for (var i = 0; i < this.head.find('tr').length; i++) {
				this.head.find('tr').eq(i).find('th').eq(
					this.head.find('tr').eq(i).find('th').length - 1).addClass('last');
			}
		}
		this.setRows(this.rows);
	},
	//移除列头
	removeHeader: function (columnName) {
		for (var i = 0; i < this.columns.length; i++) {
			if (this.columns[i].name == columnName) {
				this.columns.splice(i, 1);
				break;
			}
		}
		this.header.find('th[name="' + columnName + '"]').remove();
		this.display(this.rows);
	},
	//设置多维列头
	setMutiHeader: function (columns, headerLevel) {
		if (!columns) {
			return;
		}
		var _columns = [];
		for (var i = 0; i < columns.length; i++) {
			if (columns[i].colSpan) {
				continue;
			}
			_columns.push({
				name: columns[i].name,
				title: columns[i].title
			});
		}
		var header = '';
		for (var i = 0; i < headerLevel; i++) {
			header += '<tr>';
			for (var j = 0; j < columns.length; j++) {
				if (columns[j].rowLevel == i) {
					header += '<th ';
					if (columns[j].colSpan) {
						header += 'colspan="' + columns[j].colSpan + '" ';
					}
					if (columns[j].rowSpan) {
						header += 'rowspan="' + columns[j].rowSpan + '" ';
					}
					header += '>';
					header += columns[j].title;
					header += '</th>';
				}
			}
			header += '</tr>';
		}
		this.setHeader(_columns, header);
	},
	isHeaderVisible: function (boolFlag) {
		this.showheader = boolFlag;
		if (this.showheader) {
			this.head.show();
		} else {
			this.head.hide();
		}
	},
	//设置列事件
	setColumnEvent: function (columnName, show, hide) {
		for (var i = 0; i < this.columns.length; i++) {
			if (this.columns[i].name == columnName) {
				this.columns[i].show = show;
				this.columns[i].hide = hide;
				return true;
			}
		}
		return false;
	},
	setWidth: function (width) {
		if (width) {
			this.container.find('#' + this.id).css('width', width);
		}
	},
	setSelectedRow: function (index) {
		this.selectedIndex = index;
	},
	rowCount: function () {
		if (!this.rows) return 0;
		return this.rows.length;
	},
	initRowHeader:function(){
		if(!this.multiHeader){
			return;
		}
		var head = this.container.find('#' + this.id + ' .table_body table thead');
		if(head.length>0){
			return;
		}
		var head = this.head[0].outerHTML;
		this.container.find('#' + this.id + ' .table_body table').prepend(this.head[0].outerHTML
);		
		this.container.find('#' + this.id + ' .table_header').hide();		
	},
	addRow: function (row) {
		this.initRowHeader();
		var index = this.rows.length;
		this.rows.push(row);
		this.body.append('<tr></tr>');
		var rowElement = this.body.find('tr').eq(index);
		var colIndex=0;
		for (var j = 0; j < this.columns.length; j++) {
			if(this.columns[j].rowspan && row){				
				if(!row.hasOwnProperty(this.columns[j].name)){
					continue;
				}
			}
			var html = '<td';			
			if (this.columns[j].width) {
				var width=this.columns[j].width;
				if (this.columns[j].unit) {
					width+=this.columns[j].unit;
				} else {
					if ((this.columns[j].width + '').indexOf('%') < 0) {
						width+='%';
					}
				}
				html+=' style="width:'+width+'"';
			}			
			if(this.columns[j].rowspan && row.rowspan
				&& row.rowspan.hasOwnProperty(this.columns[j].name)){
				html+=' rowspan="'+row.rowspan[this.columns[j].name]+'"';
			}
			html+='></td>';
			rowElement.append(html);

			var tdElement=rowElement.children().eq(colIndex);

			if (row && row.hasOwnProperty(this.columns[j].name)) {
				if (row[this.columns[j].name] != undefined) {					
					tdElement.html(row[this.columns[j].name]);
				}
			} else {
				if (this.columns.length == row.length &&
					typeof (row[j]) == 'string') {
					tdElement.html(row[j]);
				}
			}
			tdElement.attr('name', this.columns[j].name);
			if (this.columns[j].visible != undefined && !this.columns[j].visible) {
				tdElement.hide();
			}			
			
			if (this.columns[j].minWidth) {
				if (this.columns[j].unit) {
					tdElement.css('min-width', this.columns[j].minWidth + this.columns[j].unit);
				} else {
					tdElement.css('min-width', this.columns[j].minWidth);
				}
			}
			if (this.columns[j].position) {
				tdElement.css('text-align', this.columns[j].position);
				var divCount = tdElement.find('td>div').length;
				if (divCount > 0) {
					tdElement.find('td>div').css('float', 'none');
					var div = tdElement.children().eq(0);
					if (divCount > 1) {
						tdElement.html('<div>' + tdElement.html() + '</div>');
						div.children().css('display', 'inline-block');
						div.children().css('float', 'left');
					}
					div.css('float', this.columns[j].position);
				}
			}
			colIndex++;
		}

		if (this.across) {
			if (index % 2) {
				rowElement.addClass('tr_even');
			} else {
				rowElement.addClass('tr_odd');
			}
		}
		if (row.onload) {
			if (rowElement.find('div.cb_nomal').length > 0) {
				rowElement.find('div.cb_checked').addClass('cb_checked');
			}
			row.onload(rowElement, index);
		}
		if (!this.showLine) {
			this.body.find('tr td').css('border-width', 0);			
		} else {	
			rowElement.find('td').eq(this.columns.length-1).css('border-right-width', '1px');			
			//rowElement.find('td').css('border-bottom-width', '1px');		
		}
	},
	//设置行是否可见
	setRowVisible: function (index, visible) {
		if (visible) {
			this.body.find('tr').eq(index).show();
		} else {
			this.body.find('tr').eq(index).hide();
		}
	},
	getRow: function (index) {
		if (this.rows.length > index) {
			return this.rows[index];
		}
	},
	getContent: function (index) {
		if (this.rows.length > index) {
			return this.body.find('tr').eq(index);
		}
	},
	getCell: function (rowIndex, columnIndex) {
		if (rowIndex >= this.rows.length ||
			columnIndex >= this.columns.length) {
			return;
		}
		return this.body.find('tr').eq(rowIndex).children().eq(columnIndex);
	},
	getColumnIndex: function (colName) {
		for (var i = 0; i < this.columns.length; i++) {
			if (this.columns[i].name == colName) {
				return i;
			}
		}
		return -1;
	},
	setSize: function () {
		var maxHeight = 0;
		if (this.container.css('max-height')) {
			maxHeight = this.container.css('max-height').replace('px', '');
		}
		if (!maxHeight) {
			if ($('#' + this.id).css('max-height')) {
				maxHeight = $('#' + this.id).css('max-height').replace('px', '');
			}
		}
		if (maxHeight > 0) {
			var headHeight = this.container.find('#' + this.id + ' .table_header').height();
			maxHeight = maxHeight - headHeight;
			this.container.find('#' + this.id + ' .table_body').css('max-height', maxHeight + 'px');
		}
		var minHeight = 0;
		if ($('#' + this.id).css("min-height")) {
			minHeight = $('#' + this.id).css("min-height").replace('px', '');
		}
		if (minHeight > 0) {
			minHeight = minHeight - this.container.find('#' + this.id + ' .table_header').height();
			this.container.find('#' + this.id + ' .table_body').css('min-height', minHeight + 'px');
		}
	},
	setRows: function (rows) {
		this.rows = rows;
		this.display(this.rows);
	},
	clearRow: function () {
		this.selectedIndex = -1;
		this.rows.splice(0, this.rows.length);
		this.display(this.rows);
	},
	romoveRow: function (showFlag) {
		if (this.selectedIndex < 0) {
			return;
		}
		this.rows.splice(this.selectedIndex, 1);
		if (showFlag) {
			this.display(this.rows);
		} else {
			this.body.find('tr').eq(this.selectedIndex).empty();
		}
	},
	selectRow: function (columnName) {
		if (this.selectedIndex < 0) {
			return undefined;
		}
		if (columnName && this.rows[this.selectedIndex] &&
			this.rows[this.selectedIndex].hasOwnProperty(columnName)) {
			return this.rows[this.selectedIndex][columnName];
		}
		return this.rows[this.selectedIndex];
	},
	hasHScroll: function () {
		return this.body.width() > this.container.find('#' + this.id + ' .table_body').height();
	},
	getModels: function () { //获取数据对象
		var models = [];
		if (!this.rows) return models;
		for (var i = 0; i < this.rows.length; i++) {
			if (this.rows[i].model) {
				models.push(this.rows[i].model);
			} else {
				models.push(this.rows[i]);
			}
		}
		return models;
	},
	upRow: function () {
		//向上移动
		if (this.selectedIndex < 0 ||
			this.rows.length == 1) {
			return;
		}
		this.changRow(); //交换数据
		//交换DOM
		this.body.find('tr').eq(this.selectedIndex).fadeOut().fadeIn();
		if (this.selectedIndex > 0) {
			$(this.body.find('tr').eq(this.selectedIndex))
				.before($(this.body.find('tr').eq(this.selectedIndex - 1)));
		} else {
			$(this.body.find('tr').eq(this.selectedIndex))
				.after($(this.body.find('tr').eq(this.rows.length - 1)));
		}
	},
	downRow: function () {
		//向下移动
		if (this.selectedIndex < 0 ||
			this.rows.length == 1) {
			return;
		}
		this.changRow(); //交换数据
		//交换DOM
		this.body.find('tr').eq(this.selectedIndex).fadeOut().fadeIn();
		if (this.selectedIndex < this.rows.length - 1) {
			$(this.body.find('tr').eq(this.selectedIndex))
				.after($(this.body.find('tr').eq(this.selectedIndex + 1)));
		} else {
			$(this.body.find('tr').eq(this.selectedIndex))
				.before($(this.body.find('tr').eq(0)));
		}
	},
	changRow: function (rowIndex1, rowIndex2) {
		var tempRow = this.rows[rowIndex1];
		this.rows[rowIndex1] = this.rows[rowIndex2];
		this.rows[rowIndex2] = tempRow;
	},
	isVisible: function () {
		return this.container.find('#' + this.id).is(':visible');
	},
	show: function () {
		this.container.find('#' + this.id).show();
	},
	hide: function () {
		this.container.find('#' + this.id).hide();
	},
	dispose: function () {
		if (this.container) {
			this.container.empty();
		}
	}
}
//显示数据
Table.prototype.display = function (rows) {
	if (!this.body) return;
	if(!rows){
		rows=this.rows;
	}
	if (rows) {
		this.body.empty();
		this.rows = [];
		if (!this.columns || this.columns.length == 0 ||
            !rows || rows.length == 0) {            
			this.container.find('#' + this.id + ' .table_body').hide();		
			return;
		}
		this.container.find('#' + this.id + ' .table_body').show();	
		for (var i = 0; i < rows.length; i++) {
			this.addRow(rows[i]);
			if (i == 0) {
				this.selectedIndex = 0;
				this.body.find('tr').eq(i).addClass('tr_selected');
				if (this.selectedRowChange) {
					this.selectedRowChange(0);
				}
			}
		}
	}
	this.attachEvent(this.selectedRowChange);
	// this.resize();
}
Table.prototype.resize = function () {
	if (!this.rows || this.rows.length == 0) {
		return;
	}
	this.container.find('#' + this.id + ' .table_header').width(this.body.width());
	this.container.find('#' + this.id + ' .table_body').width(this.body.width());
	var rows = this.body.find('tr').eq(0).children();
	var column = this.head.find('tr').last();
	for (var i = 0; i < this.columns.length; i++) {
		var width = rows.eq(i).width();
		column.children().eq(i).css('width', width + 'px');
		for (var j = 0; j < rows.length; j++) {
			this.body.find('tr').eq(j).find('td').eq(i).css('width', width + 'px');
		}
	}
}
Table.prototype.filter = function (query) {
	if (!this.rows) return;
	var count;
	for (var i = 0; i < this.rows.length; i++) {
		if (!query) {
			this.setRowVisible(i, true);
		}
		count = 0;
		for (var key in query) {
			if (!this.rows[i].hasOwnProperty(key)) {
				break;
			}
			count++;
			if (this.list[i][key] == query[key]) {
				count--;
			}
		}
		if (count == 0) {
			this.setRowVisible(i, true);
		} else {
			this.setRowVisible(i, false);
		}
	}
}
//添加事件
Table.prototype.attachEvent = function (callback) {
	if (!this.body || this.body.children().length == 0) {
		return;
	}
	this.body.find('tr').unbind('click').click(function (e) {
		$(this).parent().children().removeClass('tr_selected');
		$(this).addClass('tr_selected');
		if (callback) {
			callback($(this).index());
		}
	});
}