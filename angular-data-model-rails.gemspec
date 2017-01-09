$:.push File.expand_path("../lib", __FILE__)

require 'angular-data-model/rails/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "angular-data-model-rails"
  s.version     = AngularDataModel::Rails::VERSION
  s.authors     = ["Duka Árpád"]
  s.email       = ["duka.arpad@ejogseged.hu"]
  #s.homepage    = "TODO"
  s.summary     = "OOP-like relational data representation for angular frontend."
  s.description = "OOP-like relational data representation for angular frontend."

  s.files = Dir["{app,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]
  s.require_paths = ["lib"]

  s.add_dependency 'railties', '>= 4.0.5'
  s.add_dependency 'rails', '>= 4.0.5'
  s.add_dependency 'angularjs-rails', '>= 1.4.0'
  s.add_dependency 'angular-rails-templates', '>= 0.2.0'
  s.add_dependency 'sugar-rails', '>= 1.4.1'
  s.add_dependency 'jquery-rails', '>= 3.1.0'
  s.add_dependency 'rails-i18n', '>= 4.0'
end
