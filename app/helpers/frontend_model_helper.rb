module FrontendModelHelper

  def base_model_def model, tabs = 2
"function #{model.name}(){}#{db_name(model, tabs)}#{primary_key(model, tabs)}

#{enabled_attributes(model, tabs)}

#{behaviors(model, tabs)}
"
  end

  def enabled_attributes model, tabs = 2
"#{"  " * tabs}#{model.name}.enabled_attributes = [
#{"  " * (tabs + 1)}'_destroy', #{model.primary_key == 'uuid' ? "'id'," : ''}
#{enabled_attributes_list(model, tabs + 1)}
#{"  " * tabs}];"
  end

  def enabled_attributes_list model, tabs = 3
    max_length = model.column_names.map(&:length).max + 4
    col_count = 150 / max_length
    "  " * tabs + model.column_names.each_with_index.map{|n, i| ("'#{n}',").ljust(max_length) + (i % col_count == col_count - 1 ? "\n#{"  " * tabs}" : '')}.join
  end

  def db_name model, tabs = 2
    "\n#{"  " * tabs}#{model.name}.db_name = '#{model.name.split('::').first}';"
  end

  def primary_key model, tabs = 2
    if model.primary_key != 'uuid'
      "\n#{"  " * tabs}#{model.name}.primary_key = '#{model.primary_key}';"
    end
  end

  def behaviors model, tabs = 2
"#{"  " * tabs}#{model.name}
#{"  " * (tabs + 1)}#{checkboxes(model)}
#{"  " * (tabs + 1)}#{dates(model)}
#{"  " * (tabs + 1)}#{datetimes(model)}
#{presence_validators(model, tabs + 1)}"
  end

  def checkboxes model
    columns = attr_names_by_type(model, :boolean)
    columns == '' ? '' : "._checkbox([#{columns}])"
  end

  def dates model
    columns = attr_names_by_type(model, :date)
    columns == '' ? '' : "._date([#{columns}])"
  end

  def datetimes model
    columns = attr_names_by_type(model, :datetime)
    columns == '' ? '' : "._datetime([#{columns}])"
  end

  def attr_names_by_type model, type
    model.columns.find_all{|c| c.type == type}.map{|c| "'#{c.name}'"}.join(', ')
  end

  def presence_validators model, tabs = 3
    model.validators.find_all{|v|
      v.class == ActiveRecord::Validations::PresenceValidator &&
        v.options.empty? &&
        v.attributes.length == 1 &&
        v.attributes.first.to_s != model.primary_key
      }.map{|v| "\n#{"  " * (tabs)}.validate('#{v.attributes.first}')" }.join
  end

end