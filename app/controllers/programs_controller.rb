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

    image_name = "#{ params[ :date ] }_#{ params[ 'lang' ] }_total.jpeg"

    Dir.mkdir("public/uploads") unless File.exists?("public/uploads")

    unless File.exist?( "public/uploads/#{ image_name }" )

      file = File.open( "public/uploads/#{ image_name }", 'wb' )

      file.write (  params[:image].read )

      file.close

    end

    render json: { path: "uploads/#{ image_name }" }

  end

  def upload_to_vk
    url = params[ 'upload_url' ]
    p url
    VkontakteApi.upload(url: url, photo: ["public/#{ params[ 'image' ] }", 'image/jpeg'])

    render status: :no_content
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

      Dir.mkdir("public/uploads") unless File.exists?("public/uploads")

        body[ :data ][ 'programs' ].each do |program|

        image_name = "#{ date }_#{ program[ 'realtime_begin' ] }.jpeg"

        unless File.exist?( "public/uploads/#{ image_name }" )

          file = File.open( "public/uploads/#{ image_name }", 'wb' )

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
