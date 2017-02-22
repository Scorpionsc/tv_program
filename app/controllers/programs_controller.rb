class ProgramsController < ApplicationController
  require 'open-uri'
  require 'base64'

  def index

    @programs = get_program( nil, nil )

  end

  def get_by_date

    @programs = get_program( params[ 'date' ], params[ 'lang' ] )

    render layout: false, template: 'programs/items', status: 200

  end

  def save_file

    # p params[:image].read

    image_name = "#{ params[ :date ] }_#{ params[ 'lang' ] }_total.jpeg"

    unless File.exist?( "app/assets/images/#{ image_name }" )

      # uri = URI::Data.new( params[ 'image' ] )

      file = File.open( "app/assets/images/#{ image_name }", 'wb' )

      file.write (  params[:image].read )

      file.close

    end

    render json: { path: ActionController::Base.helpers.asset_path( image_name ) }
    # render layout: false

  end

  private

  def get_program( cur_date = nil, lang = nil )

    lang = 'ua' unless lang

    if cur_date

      response =  HTTP.get( "https://api.ovva.tv/v2/#{ lang }/tvguide/1plus1/#{ cur_date }" )

    else

      response =  HTTP.get( "https://api.ovva.tv/v2/#{ lang }/tvguide/1plus1" )

    end

    if response.code == 200

      body = JSON.parse( response.body ).symbolize_keys

      date = body[ :data ][ 'date' ]

      body[ :data ][ 'programs' ].each do |program|

        image_name = "#{ date }_#{ program[ 'realtime_begin' ] }.jpeg"

        unless File.exist?( "app/assets/images/#{ image_name }" )

          file = File.open( "app/assets/images/#{ image_name }", 'wb' )

          file.write (open(program['image']['preview']).read )

          file.close

        end

        program[ 'image' ][ 'preview' ] = "#{ image_name }"

      end

      body[ :data ]

    else

      { message: 'api.ovva.tv error' }

    end

  end

end
