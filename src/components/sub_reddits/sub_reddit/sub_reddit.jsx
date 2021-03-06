import React from "react";
import "./sub_reddit.css";
import Pagination from "./pagination/pagination";

class SubReddit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 0
    };

    this.numbersWithCommas = this.numbersWithCommas.bind(this);
    this.existingBannerToggle = this.existingBannerToggle.bind(this);
    this.postCreationDate = this.postCreationDate.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.previewPagination = this.previewPagination.bind(this);
  }

  componentDidMount() {
    this.props.fetchSubRedditAbout(
      this.props.accessToken,
      this.props.currentSubReddit
    );
  }

  componentWillReceiveProps(newProps) {
    if (
      (!this.props.accessToken && newProps.accessToken) ||
      this.props.location.pathname !== newProps.location.pathname
    ) {
      this.setState({ ["page"]: 0 });

      newProps
        .fetchSubRedditPosts(newProps.accessToken, newProps.currentSubReddit)
        .then(success => {
          newProps.fetchSubRedditAbout(
            newProps.accessToken,
            newProps.currentSubReddit
          );
        });
    }
  }

  numbersWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  existingBannerToggle(bannerUrl, headerUrl) {
    if (!bannerUrl) {
      return <img className="header-img-none" src={headerUrl} />;
    } else {
      return <img className="header-img" src={headerUrl} />;
    }
  }

  postCreationDate(unixDate) {
    let conversion = new Date(unixDate * 1000);
    return String(conversion).slice(0, 15);
  }

  prevPage() {
    let currentPage = this.state.page;
    this.setState({ ["page"]: currentPage - 1 });
  }

  nextPage() {
    let currentPage = this.state.page;
    this.setState({ ["page"]: currentPage + 1 });
  }

  previewPagination() {
    let posts = Object.values(this.props.subRedditPosts);

    if (this.state.page === 0) {
      return (
        <div className="preview-pagination">
          <p className="inactive-button">prev</p>
          <Pagination page={this.state.page + 1} />
          <p className="active-button" onClick={this.nextPage}>
            next
          </p>
        </div>
      );
    } else if (this.state.page === 9) {
      return (
        <div className="preview-pagination">
          <p className="active-button" onClick={this.prevPage}>
            prev
          </p>
          <Pagination page={this.state.page + 1} />
          <p className="inactive-button">next</p>
        </div>
      );
    } else {
      return (
        <div className="preview-pagination">
          <p className="active-button" onClick={this.prevPage}>
            prev
          </p>
          <Pagination page={this.state.page + 1} />
          <p className="active-button" onClick={this.nextPage}>
            next
          </p>
        </div>
      );
    }
  }

  subRedditPosts() {
    let posts = Object.values(this.props.subRedditPosts);
    let slicePage;
    if (this.state.page === 0) {
      slicePage = 0;
    } else {
      slicePage = this.state.page + (this.state.page * 10 - this.state.page);
    }

    return posts.slice(slicePage, slicePage + 10).map(post => {
      let points = post.data.ups - post.data.downs;
      let title;
      if (post.data.title.length > 175) {
        title = post.data.title.slice(0, 175) + "...";
      } else {
        title = post.data.title;
      }

      return (
        <div className="subreddit-post" key={post.data.id}>
          <p className="subreddit-points">{points}</p>
          <div className="subreddit-post-content">
            <p className="subreddit-post-title">
              <a href={post.data.url} target="_blank">
                {title}
              </a>
            </p>
            <div className="subreddit-post-stats">
              submitted on {this.postCreationDate(post.data.created)} by{" "}
              <p className="post-author">{post.data.author}</p>
            </div>
            <a
              className="post-comment-ct"
              href={`https://www.reddit.com${post.data.permalink}`}
              target="_blank"
            >
              {post.data.num_comments} comments
            </a>
          </div>
        </div>
      );
    });
  }

  render() {
    if (this.props.subRedditDetails) {
      return (
        <div id="subreddit-view">
          <section className="subreddit-item">
            <p className="subreddit-name">
              {this.props.subRedditDetails.about.data.url.slice(
                0,
                this.props.subRedditDetails.about.data.url.length - 1
              )}: {this.props.subRedditDetails.about.data.display_name}
            </p>
            <p className="subreddit-description">{this.props.description}</p>
            <p className="subreddit-mini-stats">
              <strong>
                {this.numbersWithCommas(this.props.subRedditDetails.points)}
              </strong>{" "}
              total points,{" "}
              <strong>
                {this.numbersWithCommas(
                  this.props.subRedditDetails.about.data.subscribers
                )}
              </strong>{" "}
              subscribers,{" "}
              <strong>
                {this.numbersWithCommas(
                  this.props.subRedditDetails.about.data.accounts_active
                )}
              </strong>{" "}
              active users
            </p>
            <p className="last-active-stats">
              Last Active Date:{" "}
              {this.props.latestActiveDate.toString().slice(0, 15)}
            </p>
          </section>

          <section className="subreddit-preview">
            <h3>/r/{this.props.currentSubReddit} Preview</h3>
            <div className="subreddit-preview-content">
              <div className="subreddit-preview-banner">
                <img
                  className="banner-img"
                  src={this.props.subRedditAbout.banner_img}
                />
                {this.existingBannerToggle(
                  this.props.subRedditAbout.banner_img,
                  this.props.subRedditAbout.header_img
                )}
              </div>

              <div className="subreddit-preview-posts">
                {this.subRedditPosts()}
              </div>
            </div>

            <div className="preview-pagination">{this.previewPagination()}</div>
          </section>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default SubReddit;
