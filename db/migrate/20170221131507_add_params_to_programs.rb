class AddParamsToPrograms < ActiveRecord::Migration[5.0]
  def change
    add_column :programs, :date, :string
    add_column :programs, :realtime_begin, :integer
    add_column :programs, :subtitle, :string
    add_column :programs, :subtitle_ru, :string
    add_column :programs, :title, :string
    add_column :programs, :title_ru, :string
    add_column :programs, :is_on_the_air, :boolean
  end
end
