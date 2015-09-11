/** @jsx React.DOM */
var ApiBoard = React.createClass({
    loadApisInformation: function() {
        $.ajax({
            url: '/apiInfo.json',
            dataType: 'json',
            cache: false,
            success: function(data){
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getAndLoadApisStatus: function() {
        $.ajax({
            url: '/v3/debug/M',
            dataType: 'json',
            cache: false,
            success: function(data){
                this.setState({statusinfo: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadApisInformation();
        setInterval(this.getAndLoadApisStatus, this.props.pullInterval);
    },
    render: function(){
        if (this.state.data.length == 0 || !this.state.statusinfo) return <div></div>;
        var categoryNodes = this.state.data.map(function(data){
            if (data.category !== "Web Socket"){
                return (
                    <CategoryList data={data} />
                );
            }
        })
        var categoryWebsocket = this.state.data.map(function(data){
            if (data.category == "Web Socket"){
                return (
                    <CategoryList data={data} />
                );
            }
        })
        return (
            <div className="apiBoard container">
                <div className="col-lg-6">
                    <div className="page-header title-font">VM5 adserver mock</div>
                    <div className="col-lg-6">
                        {categoryNodes}
                    </div>
                    <div className="col-lg-6">                   
                        {categoryWebsocket}
                    </div>
                </div>
                <div className="col-lg-6 fill">
                    <InputboxPanel />
                    <DebugPanel data={this.state.statusinfo} />
                </div>
            </div>
        );
    }
});

var CategoryList = React.createClass({
    trigger: function(url){
        url = url.replace(/:cid/, $("#Cid").val());
        url = url.replace(/:n/, $("#Secs").val());
        url = url.replace(/:code/, $("#Code").val());
        url = url.replace(/:initfps/, $("#InitfpsFps").val());
        url = url.replace(/:fps/, $("#FpsFps").val());

        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            error: function(xhr, status, err) {
                alert("Please enter your parameter!");
            }.bind(this)
        });
    },
    render: function(){
        var trigger = this.trigger;
        var apiNodes = this.props.data.apis.map(function(api){
            return (
                <ApisInfo api={api} trigger={trigger.bind(null, api.url)} />
            );
        })
        return (
            <div className="categoryList">
                <div className="list-group">
                    <div className="list-group-item list-group-item-info category-bigger">
                        {this.props.data.category}
                    </div>
                    {apiNodes}                    
                </div>
            </div>
        );
    }
});

var ApisInfo = React.createClass({
    render: function(){
        return (
            <li className="list-group-item">
                <span className="api-font">
                    {this.props.api.name}                
                </span>
                <button className="btn badge" onClick={this.props.trigger}>GO</button>
            </li>
        );
    }
});

var InputboxPanel = React.createClass({
    render: function(){
        var index = ['Secs', 'Code', 'InitfpsFps', 'FpsFps'];
        var inputNodes = index.map(function(index){
            return (
                <InputBox data={index} />
            );
        });
        return (
            <div className="InputboxPanel">
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <div className="panel-title">
                            Parameters
                        </div>
                    </div>
                    <div className="panel-body">                        
                        <div className="col-md-12 form-group">
                            <label className="col-sm-2 input-padding">Cid</label>
                            <input id="Cid" className="col-sm-4 form-control" placeholder="Cid" />
                        </div>
                        {inputNodes}
                    </div>
                </div>
            </div>
        );
    }
});

var InputBox = React.createClass({
    render: function(){
        return (
            <div className="col-md-6 form-group">
                <label className="col-sm-2 input-padding">{this.props.data}</label>
                <input id={this.props.data} className="col-sm-4 form-control" placeholder={this.props.data} />
            </div>
        );
    }
});

var DebugPanel = React.createClass({
    render: function(){
        var array_status = [];
        for (api in this.props.data) {
            var array_cids = [];
            for (cid in this.props.data[api]) {
                var array_cidinfo = [];
                if (typeof this.props.data[api][cid] !== 'object') {
                    array_cidinfo.push({dataname: 'result', data: this.props.data[api][cid].toString()});
                }
                else {
                    for (info in this.props.data[api][cid]) {
                        array_cidinfo.push({dataname:info, data: this.props.data[api][cid][info]});
                    }
                }
                array_cids.push({cid: cid, info: array_cidinfo});
            }
            array_status.push({name: api, cid: array_cids});
        };
        var debugNodes = array_status.map(function(api){
            return (
                <StatusInformation data={api} />
            );
        })
        return (
            <div className="debugPanel">
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <div className="panel-title">
                            Debug Panel
                        </div>
                    </div>
                    <div className="panel-body no-padding">
                        <table className="table table-striped no-margin">                            
                            <thead>
                                <tr>
                                    <th className="col-xs-4">
                                        APIs
                                    </th>
                                    <th className="col-xs-8">
                                        <div className="col-xs-5 no-padding">
                                            Cids
                                        </div>
                                        <div className="col-xs-7 left-padding">
                                            Status
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {debugNodes}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
});

var StatusInformation = React.createClass({
    render: function() {
        var statusNodes = this.props.data.cid.map(function(data){
            return (
                <Status data={data} />
            );
        });

        return (
            <div className="StatusInformation">                
                <tr>
                    <td className="col-xs-4">
                        {this.props.data.name}
                    </td>
                    <td className="col-xs-8">
                        {statusNodes}
                    </td>
                </tr>
            </div>
        );
    }
});

var Status = React.createClass({
    render: function() {
        var infoNodes = this.props.data.info.map(function(data){
            return (
                <CidInfo data={data} />
            );
        });
        return (
            <div className="Status">
                <div className="col-xs-5 no-padding">
                    {this.props.data.cid}
                </div>
                <div className="col-xs-7">
                    {infoNodes}
                </div>
            </div>
        );
    }
});

var CidInfo = React.createClass({
    render: function(){
        return (
            <div className="CidInfo">
                <div className="col-xs-9">
                    {this.props.data.dataname}
                </div>
                <div className="col-xs-3">
                    {this.props.data.data}
                </div>
            </div>
        );
    }
});

React.render(
  <ApiBoard url="apiInfo.json" pullInterval={500} />,
  document.getElementById('content')
);