// Object.assign( window, statem )
// window.StateMachine = statem.default


class AppStateMachine extends StateMachine {

  handlers = [
    ['cast#search#*_', ( { event } ) => nextState( 'load' )
      .data( {
        query: { $set: event.extra },
        items: { $set: [] },
      } )
      .emit( 'load', event.extra )],

    ['cast#done#load', ( { event } ) => nextState( 'gallery' )
      .data( { items: { $set: event.extra } } )],

    ['cast#error#load', 'error'],

    ['cast#cancel#load', 'gallery'],

    ['cast#enter#gallery', ( { event } ) => nextState( 'photo' )
      .data( { photo: { $set: event.extra } } )],

    ['cast#exit#photo', 'gallery'],
  ]

  initialState = 'start'

  cancel() {
    this.cast( 'cancel' )
  }

  done( items ) {
    this.cast( 'done', items )
  }

  enter( item ) {
    this.cast( 'enter', item )
  }

  error( e ) {
    this.cast( 'error', e )
  }

  exit() {
    this.cast( 'exit' )
  }

  search( q ) {
    this.cast( 'search', q )
  }
}

class App extends React.Component {

  constructor() {
    super();

    this.state = {
      query: '',
      items: [],
    };

    this.sm = new AppStateMachine( {
      initialData: this.state,
    } )

    this.sm.on( 'state', ( state, old, data ) => this.setState( {
      current: state,
      ...data,
    } ) ).on( 'load', this.doLoad.bind( this ) )
      .startSM()
  }

  /**
   * Load data from the given query
   *
   * @param query
   * @return {Promise<void>}
   */
  async doLoad( query ) {
    try {
      this.sm.done( await this.doSearch( query ) )
    }
    catch ( e ) {
      this.sm.error( e )
    }
  }

  /**
   *  Execute the given search
   * @param query
   */
  async doSearch( query ) {
    const encodedQuery = encodeURIComponent( query );

    let res = await fetchJsonp(
      `https://api.flickr.com/services/feeds/photos_public.gne?lang=en-us&format=json&tags=${encodedQuery}`,
      {
        jsonpCallback: 'jsoncallback',
      } )

    return (await res.json()).items
  }

  /**
   * Called to submit the query
   * @param e
   * @param query
   */
  handleSubmit( e, query ) {
    e.persist();
    e.preventDefault();
    this.sm.search( query )
  }

  /**
   *
   * @return {*}
   */
  render() {
    const galleryState = this.state.current;

    return (
      <div className="ui-app" data-state={ galleryState }>
        { this.renderForm( galleryState ) }
        { this.renderGallery( galleryState ) }
        { this.renderPhoto( galleryState ) }
      </div>
    );
  }

  /**
   *
   * @param state
   * @return {*}
   */
  renderForm( state ) {
    const searchText = {
      load: 'Searching...',
      error: 'Try search again',
      start: 'Search',
    }[state] || 'Search';


    return (
      <form className="ui-form"
        onSubmit={ e => this.handleSubmit( e, this.state.input ) }>
        <input
          type="search"
          className="ui-input"
          value={ this.state.input }
          onChange={ e => this.setState( {
            ...this.state,
            input: e.target.value,
          } ) }
          placeholder="Search Flickr for photos..."
          disabled={ state === 'load' }
        />
        <div className="ui-buttons">
          <button
            className="ui-button"
            disabled={ state === 'load' }>
            { searchText }
          </button>
          { state === 'load' &&
          <button
            className="ui-button"
            type="button"
            onClick={ () => this.sm.cancel() }>
            Cancel
          </button>
          }
        </div>
      </form>
    );
  }

  renderGallery( state ) {
    return (
      <section className="ui-items" data-state={ state }>
        { state === 'error'
          ? <span className="ui-error">Uh oh, search failed.</span>
          : this.state.items.map( ( item, i ) =>
            <img
              src={ item.media.m }
              className="ui-item"
              style={ { '--i': i } }
              key={ item.link }
              onClick={ () => this.sm.enter( item ) }
            />,
          )
        }
      </section>
    );
  }

  renderPhoto( state ) {
    if ( state !== 'photo' ) return;

    return (
      <section
        className="ui-photo-detail"
        onClick={ () => this.sm.exit() }>
        <img src={ this.state.photo.media.m } className="ui-photo" />
      </section>
    )
  }
}

ReactDOM.render( <App />, document.querySelector( '#app' ) );
