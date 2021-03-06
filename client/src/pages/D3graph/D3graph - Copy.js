import React, { Component } from "react";
import DeleteBtn from "../../components/DeleteBtn";
import Jumbotron from "../../components/Jumbotron";
import API from "../../utils/API";
import { Link } from "react-router-dom";
import { Col, Row, Container } from "../../components/Grid";
import { List, ListItem } from "../../components/List";
import { Input, TextArea, FormBtn} from "../../components/Form";
import axios from "axios";
import * as d3 from 'd3';
import "./graphstyle.css";



class D3graph extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    product: [],
    title: "",
    reporter: "",
    summary: "",
    newArray: [],
    component: "",
    subcomponent: "",
    severity: "",
    issueType: "",
    width: 100
  };
  lastId = -1;

  componentDidMount() {
    this.loadBooks();
    const url = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';
    
    axios.get(url).then(res => {
      const data = res.data;
      
      const width = 640,
            height = 480;
      
      //Initializing chart
      const chart = d3.select('.chart')
        .attr('width', width)
        .attr('height', height);
      
      //Creating tooltip
      const tooltip = d3.select('.container')
        .append('div')
        .attr('class', 'tooltip')
        .html('Tooltip');
      
      //Initializing force simulation
      const simulation = d3.forceSimulation()
        .force('link', d3.forceLink())
        .force('charge', d3.forceManyBody())
        .force('collide', d3.forceCollide())
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("y", d3.forceY(0))
        .force("x", d3.forceX(0));
      
      
      //Drag functions
      const dragStart = d => {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      };
      
      const drag = d => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      };
      
      const dragEnd = d => {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      
      //Creating links
      const link = chart.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(data.links).enter()
        .append('line');
      
      //Creating nodes
      const node = d3.select('.chartContainer')
        .selectAll('div')
        .data(data.nodes).enter()
        .append('div')
        .attr('class', d => {return 'flag flag-' + d.code;})
        .call(d3.drag()
           .on('start', dragStart)
           .on('drag', drag)
           .on('end', dragEnd)
        ).on('mouseover',d => {
          tooltip.html(d.country)
            .style('left', d3.event.pageX + 5 +'px')
            .style('top', d3.event.pageY + 5 + 'px')
            .style('opacity', .9);
        }).on('mouseout', () => {
          tooltip.style('opacity', 0)
            .style('left', '0px')
            .style('top', '0px');
        });
      
      //Setting location when ticked
      const ticked = () => {
        link
          .attr("x1", d => { return d.source.x; })
          .attr("y1", d => { return d.source.y; })
          .attr("x2", d => { return d.target.x; })
          .attr("y2", d => { return d.target.y; });

      node
          .attr("style", d => { 
            return 'left: ' + d.x + 'px; top: ' + (d.y + 72) + 'px'; 
          });
      };
      
      //Starting simulation
      simulation.nodes(data.nodes)
        .on('tick', ticked);
      
      simulation.force('link')
        .links(data.links);
    
    });
  }
  
   loadBooks = () => {
        API.getBooks()
        .then(res =>
          this.setState({ product: res.data, title: "", reporter: "", summary: "", component: "", subcomponent: "", severity: "", issueType: "" })
        )
        .catch(err => console.log(err));
    };

  render() {
    return (
      <div className='container'>
        <Jumbotron>  
         <h1>Issues Graph</h1>
        </Jumbotron>
        <div className='chartContainer'>
          <svg className='chart'>chart
          </svg>
        </div>
                  <Col size="md-12 sm-12">

              <h1>Issues Reported</h1>

            {this.state.product.length ? (
              <List>
                {this.state.product.map(book => (
                  <ListItem key={book._id}>
                    <Link to={"/books/" + book._id}>
                      <strong>
                        {book.title} by {book.reporter}
                      </strong>
                    </Link>
                    <DeleteBtn onClick={() => this.deleteBook(book._id)} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <h3>No Results to Display</h3>
            )}
          </Col>
      </div>



    ); 
  }
}

export default D3graph;