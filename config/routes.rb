Rails.application.routes.draw do
  root 'programs#index'
  get 'programs', to: 'programs#get_by_date'
  post 'get_image', to: 'programs#save_file'
  post 'upload_to_vk', to: 'programs#upload_to_vk'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
