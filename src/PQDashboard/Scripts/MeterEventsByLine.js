//******************************************************************************************************
//  MeterEventsByLine.js - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  10/03/2016 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************



var postedMeterId = "";
var postedDate = "";
var postedMeterName = "";
var dataHub = null;


$(document).ready(function () {
    dataHub = $.connection.dataHub.server;
    $.connection.hub.start().done(function () {
        populateMeterEventsDivWithGrid('getSiteLinesDetailsByDate', "MeterDetailsByDate", postedMeterName, postedMeterId, postedDate);
    });

    postedMeterId = $("#postedMeterId")[0].innerHTML;
    postedDate = $("#postedDate")[0].innerHTML;
    postedMeterName = $("#postedMeterName")[0].innerHTML;


});

var floatrenderer = function (row, columnfield, value, defaulthtml, columnproperties, rowdata) {

    return '<div style="text-align: center; margin-top: 5px;">' + parseFloat(value).toFixed(4) + "m" + '</div>';

}

var columnsrenderer = function (value) { return '<div style="text-align: center; margin-top: 5px;">' + value + '</div>'; };

function populateMeterEventsDivWithGrid(thedatasource, thediv, siteName, siteID, theDate) {

    var thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "'}";

    $.ajax({
        type: "POST",
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            json = $.parseJSON(data.d);

            $.each(json, function (_, obj) {
                obj.thelinename = Number(obj.thelinename);
                obj.voltage = Number(obj.voltage);
                obj.thecurrentdistance = Number(obj.thecurrentdistance);
            });

            $('#' + thediv).puidatatable({
                scrollable: true,
                scrollHeight: '100%',
                scrollWidth: '100%',
                columns: [
                    { field: 'theinceptiontime', headerText: 'Start Time', headerStyle: 'width: 30%', bodyStyle: 'width: 30%; height: 20px', sortable: true },
                    { field: 'theeventtype', headerText: 'Event Type', headerStyle: 'width: 20%', bodyStyle: 'width: 20%; height: 20px', sortable: true, content: function(row, line, element){
                        var html = "<select id='select"+row.theeventid+"' class='form-control'>" +
                                      "<option value='7' "+ (row.theeventtype === "Test"? "selected" : "")+ ">Test</option>" +
                                    "</select>";
                        dataHub.getEventTypeID(row.theeventid).done(function (eventType) {
                            if (eventType.Name !== "Other")
                                $('#select' + row.theeventid).prepend("<option value='6' " + (row.theeventtype === "Other" ? "selected" : "") + ">Other</option>");

                            $('#select' + row.theeventid).prepend("<option value='" + eventType.ID + "' " + (row.theeventtype === eventType.Name ? "selected" : "") + ">" + eventType.Name + " (Original)</option>");
                            $('#select' + row.theeventid).on('change', function (event) {
                                dataHub.setEventTypeID(row.theeventid, $('#select' + row.theeventid).val())
                            });


                        });


                        return html;

                     }},
                    { field: 'thelinename', headerText: 'Line Name', headerStyle: 'width: 20%', bodyStyle: 'width:  20%; height: 20px', sortable: true },
                    { field: 'voltage', headerText: 'Line KV', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true },
                    { field: 'thefaulttype', headerText: 'Phase', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true },
                    { field: 'thecurrentdistance', headerText: 'Distance', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
                    {
                        headerText: '', headerStyle: 'width: 20%', content: function (row) {
                            var key = Object.keys(row).filter(function(a){
                                return  a !== 'thecurrentdistance' &&
                                        a !== 'theeventid' &&
                                        a !== 'theeventtype' &&
                                        a !== 'thefaulttype' &&
                                        a !== 'theinceptiontime' &&
                                        a !== 'thelineid' &&
                                        a !== 'thelinename' &&
                                        a !== 'pqiexists' &&
                                        a !== 'voltage';
                                });
                            var html = "";

                            html += makeOpenSEEButton_html(row);

                            if (row.theeventtype == "Fault")
                                html += makeFaultSpecificsButton_html(row);
                            if (row.pqiexists !== '0')
                                html += makePQIButton_html(row);

                            $.each(key, function (i, k) {
                                if (row[k] !== '0')
                                    html += makeEASDetailsButton_html(row, row[k], k + '.aspx', 'images/' + k + '.png', 'Launch '+ k + ' Page' ,300, 450);
                            });

                            return html;
                        }
                    }
                ],
                datasource: $.parseJSON(data.d)
            });
        }
    });
}

function makeEASDetailsButton_html(row, value, url, imagepath, title, width, height) {
    var return_html = "";

    url += "?eventid=" + row.theeventid;

    if (value != "" && value != "0" && value != null) {

        //return_html += '<div style="cursor: pointer;">';
        return_html += '<button onClick="OpenWindowToEAS(' + "'" + url + "'"+"," + width + "," + height  + ');"  title="' + title + '">';
        return_html += '<img src="'+ imagepath + '" /></button>';
        //return_html += '</div>';
    }
    return (return_html);
}


function OpenWindowToEAS(url, width, height) {
    var popup = window.open(url, url, "left=0,top=0,width="+width+",height="+height+",status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");
    return false;
}


function makeOpenSEEButton_html(id) {
    var return_html = "";
    //return_html += '<div style="cursor: pointer;">';
    return_html += '<button onClick="OpenWindowToOpenSEE(' + id.theeventid + ');" title="Launch OpenSEE Waveform Viewer">';
    return_html += '<img src="images/seeButton.png" /></button>';
    //return_html += '</div>';
    return (return_html);
}

function makeFaultSpecificsButton_html(id) {
    var return_html = "";

    if (id.theeventtype == "Fault") {
        //return_html += '<div style="cursor: pointer;">';
        return_html += '<button onClick="OpenWindowToFaultSpecifics(' + id.theeventid +');" title="Open Fault Detail Window">';
        return_html += '<img src="images/faultDetailButton.png" /></button>';
        //return_html += '</div>';
    }
    return (return_html);
}

function makePQIButton_html(id) {
    var return_html = "";

    if (id.pqiexists == "1") {
        //return_html += '<div style="cursor: pointer;">';
        return_html += '<button onClick="OpenWindowToPQI(' + id.theeventid + ');"title="Open PQI Window">';
        return_html += '<img src="images/pqiButton.png" /></button>';
        //return_html += '</div>';
    }
    return (return_html);
}

function OpenWindowToOpenSEE(id) {
    var popup = window.open("openSEE.aspx?eventid=" + id + "&faultcurves=1", id + "openSEE", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

function OpenWindowToFaultSpecifics(id) {
    var popup = window.open("FaultSpecifics.aspx?eventid=" + id, id + "FaultLocation", "left=0,top=0,width=300,height=200,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");
    return false;
}

function OpenWindowToPQI(id) {
    var popup = window.open("PQIByEvent.aspx?eventid=" + id, id + "PQI", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");
    return false;
}
