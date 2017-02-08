import React from 'react';
import {render} from 'react-dom';
import $ from 'jquery';
var Highcharts = require('highcharts/highstock');

var Chart = React.createClass({
    postWebRequests: function (url, cid, commands) {
        var data = {
            "cid": cid,
            "commands": commands
        }
        $.ajax({
            url : url,
            type: "POST",
            data: data,
            success: function(data){
                console.log("ajax post return data:", data);
            }.bind(this),
            error: function(xhr, status, err) {
                alert("Error!!");
            }.bind(this)
        });
    },
    componentDidMount: function () {
        console.log("In componenet did mount!");
        var options = {
            title: {
                text: 'Web Socket Connection Profile'
            },
            xAxis: {
                title: {
                    text: 'Time(s)'
                },
                min: -3,
                max: this.props.time
            },
            yAxis: {
                title: {
                    text: 'Fps',
                    align: 'high',
                    offset: 10,
                    rotation: 0,
                    y: -25
                },
                min: 0,
                max: 100
            },
            series: [{
                name: 'Time vs fps',
                data: [],
                step: 'left'
            }, {
                type: 'flags',
                name: 'Cloud',
                color: '#333333',
                shape: 'squarepin',
                y: -55,
                data: [],
                showInLegend: false
            }]
        };
        this.chart = new Highcharts[this.props.type || "Chart"](
            this.props.container, 
            options
        );
        this.chart.xAxis[0].setExtremes(-3, this.props.time);
    },
    //Destroy chart before unmount.
    componentWillUnmount: function () {
        this.chart.destroy();
    },
    componentWillReceiveProps: function(props) {
        this.chart.xAxis[0].setExtremes(-3, props.time);
        if ((props.lineData.length > 0 && props.lineData[props.lineData.length-1].x > props.time) || (props.flagData.length > 0 && props.flagData[props.flagData.length-1].x >= props.time)) {
            console.log(props.lineData[props.lineData.length-1]);
            alert("Time of web setting exceeds game time. Please reset!");
            var commands = [{
                "trigger": "on-connect",
                "type": "unthrottle"
            }]
            var cid = this.props.cid;
            this.postWebRequests(this.props.urlPrefix + "/v4/pre-schedule", cid, commands);
        }
        else {
            this.chart.series[0].setData(props.lineData);
            this.chart.series[1].setData(props.flagData);
        }
    },
    render: function() {
        //console.log("chart data:", this.props.data);
        return (
            <div id={this.props.container}></div>
        );
    }
});

export default Chart;