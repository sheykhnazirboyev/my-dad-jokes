import React, {Component} from 'react';
import axios from 'axios';
import uuid from 'uuid/v4';
import Joke from './Joke';
import './JokeList.css';

class JokeList extends Component
{
	static defaultProps = {
		numJokes: 10
	}

	constructor(props)
	{
		super(props);
		this.state = { jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"), loading: false };
		this.seenJoke = new Set(this.state.jokes.map(j => j.text));
		this.newJokes = this.newJokes.bind(this);
	}

	componentDidMount()
	{
		if(this.state.jokes.length === 0)
		{
			this.getJokes();
		}
	}

	async getJokes()
	{
		try{
			
			let jokes = [];

			while(jokes.length < this.props.numJokes)
			{
				let res = await axios.get("https://icanhazdadjoke.com/", { headers: { Accept: "application/json"}});	
				let newJoke = res.data.joke;
				if(!this.seenJoke.has(newJoke))
				{
					jokes.push({ text: res.data.joke, votes: 0, id: uuid() })
				} else {
					console.log("Found Duplicate");
					console.log(newJoke)
				}
				
			}
			
			this.setState( st => ({
				jokes: [...this.state.jokes,...jokes],
				loading: false
			}),
				() => window.localStorage.setItem("jokes", JSON.stringify(jokes))
			);

		}	 catch(e) {
				alert(e);
		}
	}

	handleVotes(id,delta)
	{
		this.setState(st => ({
			jokes: this.state.jokes.map( j => 
				j.id === id ? {...j, votes: j.votes + delta} : j)
		}),
			() => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
		);
	}

	newJokes()
	{
		this.setState({ loading: true }, this.getJokes)
	}

	render()
	{
		let jokes = this.state.jokes.map(j => 
			<Joke 
					text = {j.text} 
					votes = {j.votes} 
					key = {j.id} 
					upVote = { () => this.handleVotes(j.id, 1)}
					downVote = { () => this.handleVotes(j.id, -1) }

				/>
			)

			if(this.state.loading)
			{
				return(
					<div className = "JokeList-spinner">
					<i className = "far fa-8x fa-laugh fa-spin"></i>
					<h1 className = 'JokeList-title'>Loading...</h1>
				</div>
					)
			}

		return(
			<div className = "JokeList">
				<div className = "JokeList-sidebar">
					<h1 className = "JokeList-title"><span>Dad</span> Jokes</h1>
					<img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt="Joke"/>
					<button className = "JokeList-getmore" onClick = {this.newJokes}>Get Jokes</button>
				</div>
				<div className = "JokeList-jokes">
					{ jokes }
				</div>
			</div>
			);
	}
}	

export default JokeList;