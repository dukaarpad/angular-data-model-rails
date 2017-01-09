# encoding: utf-8

module AngularDataModel
  module Rails
    class Engine < ::Rails::Engine
      initializer "configure assets of normalize-rails", :group => :all do |app|
        app.config.angular_templates.inside_paths.push File.expand_path("../../../../app/assets/javascripts", __FILE__)
        app.config.assets.precompile += %w( normalize-rails/*.css )
        app.config.assets.precompile += [
          '*.html',
          '*/*.html'
        ]
      end
    end
  end
end