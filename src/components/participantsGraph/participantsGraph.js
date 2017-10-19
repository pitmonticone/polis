import React from "react";
import _ from "lodash";
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';
import * as globals from "../globals";
import graphUtil from "../../util/graphUtil";
import Axes from "../graphAxes";
import * as d3contour from 'd3-contour';
import * as d3chromatic from 'd3-scale-chromatic';
import GroupLabels from "./groupLabels";
import Comments from "../commentsGraph/comments";
import Hull from "./hull";

const pointsPerSquarePixelMax = .0017; /* choose dynamically ? */
const contourBandwidth = 23;
const colorScaleDownFactor = .5; /* The colors are too dark. This helps. */

const color = d3.scaleSequential(d3chromatic.interpolateYlGnBu)
// const color = d3.scaleSequential(d3.interpolateMagma)
// const color = d3.scaleSequential(d3.interpolateYlGn)
  .domain([0, pointsPerSquarePixelMax]);
  // .domain([pointsPerSquarePixelMax, 0]);
const geoPath = d3.geoPath();

const Contour = ({contour}) => <path fill={color(contour.value * colorScaleDownFactor)} d={geoPath(contour)} />

const Participants = ({points}) => {

  if (!points) {
    return null
  }
// transform={`translate(${globals.side / 2},${globals.side / 2})`}>
  return (
    <g>
      {points.map((pt, i) => {
        // return <circle
        //   r={2}
        //   fill={globals.groupColor(pt.gid)}
        //   key={i}
        //   cx={pt.x}
        //   cy={pt.y}/>
        return (<text
            key={i}
            transform={
              `translate(
                ${pt.x},
                ${pt.y}
              )`
            }
            style={{
              fill: "rgba(0,0,0,.5)",
              fontSize: 12,
            }}
            >
            {globals.groupSymbols[pt.gid]}
          </text>)
      })}
    </g>
  );
}

class ParticipantsGraph extends React.Component {

  constructor(props) {
    super(props);
    this.Viewer = null;
    this.state = {
      selectedComment: null,
      showContour: true,
      showGroupLabels: true,
      showParticipants: false,
      showGroupOutline: true,
      showComments: true,
      showAxes: false,
    };
  }

  handleCommentClick(selectedComment) {
    return () => {
      this.setState({selectedComment});
    }
  }

  handleCommentClick(selectedComment) {
    return () => {
      this.setState({selectedComment});
    }
  }
  render() {

    if (!this.props.math) {
      return null;
    }

    const {
      xx,
      yy,
      commentsPoints,
      xCenter,
      yCenter,
      baseClustersScaled,
      commentScaleupFactorX,
      commentScaleupFactorY,
      hulls,
    } = graphUtil(this.props.comments, this.props.math, this.props.badTids);

    const contours = d3contour.contourDensity()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .size([globals.side, globals.side])
        // .bandwidth(10)(baseClustersScaled)
        .bandwidth(contourBandwidth)(baseClustersScaled)

    return (
      <div style={{position: "relative"}}>
        <div>
          <p style={globals.primaryHeading}> Participants </p>
          <p style={globals.paragraph}>
          How do participants relate to each other?
          </p>
          <p style={globals.paragraph}>
          In this graph, participants are positioned closer to statements on which the agreed (see Comments graph above)
          and further from statements on which they disagreed.
          This means participants who voted similarly are closer together.
          </p>
          <p style={globals.paragraph}>
            This is meaningful as it lends visual weight to the <i>amount</i> of people who fall in each quadrant,
            the characteristics of which have been established above.
          </p>
        </div>


          <p style={{fontWeight: 500, maxWidth: 600, lineHeight: 1.4, minHeight: 50}}>
            {
              this.state.selectedComment ?
              "#" + this.state.selectedComment.tid + ". " + this.state.selectedComment.txt :
              "Click a comment, identified by its number, to explore regions of the graph."
            }
          </p>
          <div>
          <button
            style={{
              color: this.state.showContour ? "white" : "black",
              border: this.state.showContour ? "1px solid #03A9F4" : "1px solid black",
              cursor: "pointer",
              borderRadius: 3,
              background: this.state.showContour ? "#03A9F4" : "none",
              padding: 4,
              marginRight: 20
            }}
            onClick={() => { this.setState({showContour: !this.state.showContour}) }}>
            Density
          </button>
          <button
            style={{
              color: this.state.showAxes ? "white" : "black",
              border: this.state.showAxes ? "1px solid #03A9F4" : "1px solid black",
              cursor: "pointer",
              borderRadius: 3,
              background: this.state.showAxes ? "#03A9F4" : "none",
              padding: 4,
              marginRight: 20
            }}
            onClick={() => { this.setState({showAxes: !this.state.showAxes}) }}>
            Axes
          </button>
          <button
            style={{
              color: this.state.showComments ? "white" : "black",
              border: this.state.showComments ? "1px solid #03A9F4" : "1px solid black",
              cursor: "pointer",
              borderRadius: 3,
              background: this.state.showComments ? "#03A9F4" : "none",
              padding: 4,
              marginRight: 20
            }}
            onClick={() => { this.setState({showComments: !this.state.showComments}) }}>
            Comments
          </button>
          <button
            style={{
              color: this.state.showParticipants ? "white" : "black",
              border: this.state.showParticipants ? "1px solid #03A9F4" : "1px solid black",
              cursor: "pointer",
              borderRadius: 3,
              background: this.state.showParticipants ? "#03A9F4" : "none",
              padding: 4,
              marginRight: 20
            }}
            onClick={() => { this.setState({showParticipants: !this.state.showParticipants}) }}>
            Participants (bucketized)
          </button>
          <button
            style={{
              color: this.state.showGroupOutline ? "white" : "black",
              border: this.state.showGroupOutline ? "1px solid #03A9F4" : "1px solid black",
              cursor: "pointer",
              borderRadius: 3,
              background: this.state.showGroupOutline ? "#03A9F4" : "none",
              padding: 4,
              marginRight: 20
            }}
            onClick={() => { this.setState({showGroupOutline: !this.state.showGroupOutline}) }}>
            Group outline
          </button>
          <button
            style={{
              color: this.state.showGroupLabels ? "white" : "black",
              border: this.state.showGroupLabels ? "1px solid #03A9F4" : "1px solid black",
              cursor: "pointer",
              borderRadius: 3,
              background: this.state.showGroupLabels ? "#03A9F4" : "none",
              padding: 4,
              marginRight: 20
            }}
            onClick={() => { this.setState({showGroupLabels: !this.state.showGroupLabels}) }}>
            Group labels
          </button>
          </div>
          {this.state.showParticipants || true ? <p style={globals.paragraph}>
            {hulls.map((h,i) => {
              return (
                <span style={{marginRight: 40}} key={i}>
                  {`${globals.groupSymbols[i]} ${globals.groupLabels[i]}`}
                </span>
              )
            })}
          </p> : null}
          <svg
            width={this.props.height ? this.props.height : globals.side}
            height={this.props.height ? this.props.height : globals.side}>
            {this.state.showContour ? contours.map((contour, i) => <Contour key={i} contour={contour} />) : null}
            {this.state.showAxes ? <Axes xCenter={xCenter} yCenter={yCenter} report={this.props.report}/> : null}
            {
              this.state.showGroupOutline ? hulls.map((hull) => {
                let gid = hull.group[0].gid;
                if (_.isNumber(this.props.showOnlyGroup)) {
                  if (gid !== this.props.showOnlyGroup) {
                    return "";
                  }
                }
                return <Hull key={gid} hull={hull}/>
              }) : null
            }
            {
              this.state.showParticipants ?
                <Participants
                  points={baseClustersScaled}/>
                : null
            }
            {
              this.state.showComments ? <Comments
                {...this.props}
                handleClick={this.handleCommentClick.bind(this)}
                parentGraph={"contour"}
                points={commentsPoints}
                xx={xx}
                yy={yy}
                xCenter={xCenter}
                yCenter={yCenter}
                xScaleup={commentScaleupFactorX}
                yScaleup={commentScaleupFactorY}/>
              : null
            }
            {
              this.state.showGroupLabels ? this.props.math["group-clusters"].map((g, i) => {
                // console.log('g',g )
                return <text
                    key={i}
                    transform={
                      `translate(
                        ${xx(g.center[0])},
                        ${yy(g.center[1])}
                      )`
                    }
                    style={{
                      fill: "rgba(0,0,0,.5)",
                      fontFamily: "Helvetica",
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                    >
                    {globals.groupLabels[g.id]}
                  </text>
              }) : null
            }
          </svg>
      </div>
    );
  }
}

export default ParticipantsGraph;

// <svg
//   style={{
//     // border: "1px solid rgb(180,180,180)",
//
//   }}
//   width={this.props.height ? this.props.height : globals.side}
//   height={this.props.height ? this.props.height : globals.side}>
//   {/* Comment https://bl.ocks.org/mbostock/7555321 */}
//   <g transform={`translate(${globals.side / 2}, ${15})`}>
//     <text
//       style={{
//         fontFamily: "Georgia",
//         fontSize: 14,
//         fontStyle: "italic"
//       }}
//       textAnchor="middle">
//
//     </text>
//   </g>
//   <Axes xCenter={xCenter} yCenter={yCenter} report={this.props.report}/>
//   <Participants points={baseClustersScaled}/>
// </svg>
