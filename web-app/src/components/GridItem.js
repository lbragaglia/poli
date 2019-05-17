import React from 'react';
import ReactDOM from 'react-dom';
import ReactEcharts from 'echarts-for-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import * as EchartsApi from '../api/EchartsApi';
import * as Util from '../api/Util';
import * as Constants from '../api/Constants';

import GridDraggable from './GridDraggable';
import GridResizable from './GridResizable';
import TableWidget from './TableWidget';
import Slicer from './filters/Slicer';

class GridItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      mode: ''
    };
  }

  componentWillUnmount() {
    const thisNode = ReactDOM.findDOMNode(this);
    if (thisNode) {
      const { ownerDocument } = thisNode;
      ownerDocument.removeEventListener('mousedown', this.onMouseDown);
      ownerDocument.removeEventListener('mouseup', this.onMouseUp);
      ownerDocument.removeEventListener('mousemove', this.onMouseMove);
    }
  }

  onMouseDown = (mode) => {
    this.setState({
      mode: mode
    });
  }

  onMouseUp = () => {
    this.setState({
      mode: ''
    });

    const thisNode = ReactDOM.findDOMNode(this);
    const x = thisNode.offsetLeft;
    const y = thisNode.offsetTop;
    const width = parseInt(thisNode.style.width, 10);
    const height = parseInt(thisNode.style.height, 10);
    const widgetId = this.props.id;

    const widget = {
      id: widgetId,
      x: x,
      y: y,
      width: width,
      height: height
    }

    this.props.onWidgetMove(widget);
  }

  onMouseMove = (event, mode, state) => {
    event.preventDefault();   
  }

  editWidget = (widgetId) => {
    this.props.onWidgetEdit(widgetId);
  }

  exportCsv = (widgetId) => {

  }

  exportJson = (widgetId) => {

  }

  removeWidget = (widgetId) => {
    this.props.onWidgetRemove(widgetId);
  }

  onChartClick = (param, echarts) => {
    const {
      drillThrough = [],
      data = {}
    } = this.props;

    if (drillThrough.length === 0) {
      return;   
    }

    const { 
      pieKey,
    } = data;
    const columnName = pieKey;
    const columnValue = param.name;

    const index = drillThrough.findIndex(d => d.columnName === columnName);
    if (index === -1) {
      return;
    }
    
    const dashboardId = drillThrough[index].dashboardId;
    const widgetClickEvent = {
      type: 'pieClick',
      data: {
        dashboardId: dashboardId,
        columnName: columnName,
        columnValue: columnValue
      }
    }
    this.props.onWidgetContentClick(widgetClickEvent);
  };

  onChartLegendselectchanged = (param, echart) => {
  };

  onTableTdClick = (dashboardId, columnName, columnValue) => {
    const widgetClickEvent = {
      type: 'tableTdClick',
      data: {
        dashboardId: dashboardId,
        columnName: columnName,
        columnValue: columnValue
      }
    }
    this.props.onWidgetContentClick(widgetClickEvent);
  }

  onSlicerChange = (widgetId, checkBoxes) => {
    const data = {
      checkBoxes: checkBoxes
    };
    this.props.onWidgetFilterInputChange(widgetId, data);
  }

  onSingleValueChange = (widgetId, event) => {
    const value = event.target.value;
    const data = {
      value: value
    };
    this.props.onWidgetFilterInputChange(widgetId, data);
  }

  renderWidgetContent = () => {
    const onChartEvents = {
      'click': this.onChartClick,
      'legendselectchanged': this.onChartLegendselectchanged
    };

    const { 
      id,
      type,
      chartType,
      filterType,
      queryResult = {},
      drillThrough,
      data = {},
      checkBoxes,
      value
    } = this.props;

    const queryResultData = Util.jsonToArray(queryResult.data);
    const columns = queryResult.columns || [];
    const error = queryResult.error;

    let widgetItem = (<div></div>);
    if (type === Constants.CHART) {
      if (chartType === Constants.TABLE) {
        widgetItem = (
          <TableWidget
            data={queryResultData}
            columns={columns}
            error={error}
            drillThrough={drillThrough}
            onTableTdClick={this.onTableTdClick}
          />
        );
      } else if (chartType === Constants.PIE) {
        const { 
          pieKey,
          pieValue
        } = data;
        const chartOption = EchartsApi.getPieOption(queryResultData, pieKey, pieValue);
        widgetItem = (
          <ReactEcharts 
            option={chartOption}   
            className="echarts"
            onEvents={onChartEvents}  
          />
        );
      } 
    } else if (type === Constants.FILTER) {
      if (filterType === Constants.SLICER) {
        widgetItem = (
          <div className="grid-box-content-panel">
            <Slicer 
              id={id} 
              checkBoxes={checkBoxes} 
              onChange={this.onSlicerChange} 
            />
          </div>
        );
      } else if (filterType === Constants.SINGLE_VALUE) {
        widgetItem = (
          <div className="grid-box-content-panel">
            <input 
              type="text"  
              value={value}
              onChange={(event) => this.onSingleValueChange(id, event)} 
            />
          </div>
        );
      }
    }
    
    return widgetItem;
  }

  render() {
    const {
      id,
      title,
      isEditMode,
      style = {},
      drillThrough
    } = this.props;

    const { 
      showBorder = false,
      showTitle = true,
      borderColor,
      titleFontColor,
      titleBackgroundColor,
      contentBackgroundColor,
      zIndex
    } = style;

    const borderStyle = showBorder ? `2px solid ${borderColor}` : '2px solid transparent';

    let gridBoxStyle = {
      left: this.props.x + 'px',
      top: this.props.y + 'px',
      width: this.props.width + 'px',
      height: this.props.height + 'px',
      zIndex: zIndex,
      border: borderStyle
    };

    const hasDrillThrough = !Util.isArrayEmpty(drillThrough);

    const titleStyle = {
      color: titleFontColor,
      backgroundColor: titleBackgroundColor
    };

    const contentStyle = {
      backgroundColor: contentBackgroundColor
    }

    /*
    <div className="grid-box-file-button-group">
      <div className="inline-block" onClick={() => this.exportJson(id)}>
        <FontAwesomeIcon icon="file-export" fixedWidth />
      </div>
      
      <div className="inline-block" onClick={() => this.exportCsv(id)}>
        <FontAwesomeIcon icon="file-csv" fixedWidth />
      </div>
      <div className="grid-box-file-button-group">
              <div className="inline-block">
                <FontAwesomeIcon icon="external-link-alt" fixedWidth />
              </div>
            </div>
    </div>
    */

    return (
      <div className="grid-box" style={gridBoxStyle}>
        { isEditMode && (
          <GridDraggable 
            onMouseUp={this.onMouseUp}
            onMouseDown={this.onMouseDown}
            onMouseMove={this.onMouseMove}
            mode={this.state.mode}
            snapToGrid={this.props.snapToGrid} 
          >
            { showTitle && (
              <div className="grid-box-title" style={titleStyle}>
                <div className="grid-box-title-value ellipsis" style={{marginRight: '50px'}}>{title}</div>
              </div>
            )}
          </GridDraggable>
        )}

        { (!isEditMode && showTitle) && (
          <div className="grid-box-title" style={titleStyle}>
            <div className="grid-box-title-value ellipsis">{title}</div>
          </div>
        )}

        { isEditMode && (
          <div className="grid-edit-panel">
            <div className="grid-box-icon inline-block" onClick={() => this.editWidget(id)}>
              <FontAwesomeIcon icon="edit" fixedWidth />
            </div>
            <div className="grid-box-icon inline-block" onClick={() => this.removeWidget(id)}>
              <FontAwesomeIcon icon="trash-alt" fixedWidth />
            </div>
          </div>
        )}

        { !isEditMode && hasDrillThrough && (
          <div className="grid-edit-panel grid-box-icon inline-block">
            <FontAwesomeIcon icon="flag" fixedWidth />
          </div>
        )}
        <div className="grid-box-content" style={contentStyle}>
          {this.renderWidgetContent()}
        </div>

        { isEditMode && (
          <GridResizable 
            onMouseUp={this.onMouseUp}
            onMouseDown={this.onMouseDown}
            onMouseMove={this.onMouseMove}
            mode={this.state.mode} 
          />
        )}
        
      </div>
    )
  }
}

export default GridItem;