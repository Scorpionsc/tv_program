Rails.application.routes.draw do
  root 'programs#index'
  get 'programs', to: 'programs#get_by_date'
  post 'get_image', to: 'programs#save_file'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
