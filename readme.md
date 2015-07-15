# iron-select

## Tagging-style multiselect box for Polymer 1.0

This is a tagging-style custom element built entirely from the ground up on [Polymer](http://www.polymer-project.org) and iron-components.
Aims to provide the same functionality as Selectize, Chosen2 and friends, using only vanilla JS and Polymer.

**Integrates with native form posting values upon submit as expected - no additional code required.** ([but how?](#native-form-integration))

## Usage

		<iron-select
			// placeholder for the input element
			placeholder
			
			// url to query
			dataSource
			
			//  query parameters to query by label
			dataSourceQueryByLabel
			dataSourceQueryByValue
			dataSourceQueryField
			
			// minimum length of string to query
			minLength

			// label and value fields on the received objects
			valueField ["value"]
			labelField ["label"]
			
			// prevents submission when hitting enter inside the box
			preventDefault [true]
			
			// allows adding (new) element without value
			allowCreate
			cloneToNative - If element is inside a <form> tag and has a name set, a sibling hidden element with the same name will be created and its value will be updated to reflect the iron-select element value. Defaults to true.
			name - specifies input name, has meaning when cloneToNative is true.
			
			value
			>
			<iron-select-item label="label1" value="label1">
			<iron-select-item label="label2" value="label2">
		</iron-select>



## Notes
* iron-select-item presets may be added in HTML as above or omitted
* use ironSelect.select = [<array of value objects>] to set selection during runtime


This component is functional but is still a work in progress. Contributions are welcome.

# Style
Some styling is set internally.
As `iron-select-item` elements live in the Light DOM they may be styled by component user just like any element.

The intent is to make the component fully customizable.

# Setting selected values
**Using DOM**: Upon initialization (on 'ready') iron-select will pick up its Light DOM for `iron-select-item` elements and update its value accordingly. Use standard DOM operations to add/remove `iron-select-item`-s during runtime and iron-select will update its value instantly.

**Using the `.select` property**: Assign an array of objects to the `select` property to entirely replace the current selection.

# Dynamic integration
Use `.value` property, it's always up to date. You may want to listen to the `'change'` event on the component and process `.value` in the event handler.

<a name="native-form-integration"></a>
# Native form integration
You might have been puzzled about how exactly a non-native component may be submitted as part of a static form. You might also be aware that it's not possibble to append child elements to input elements. Thus it's not possible to enrich an input with shadow dom. 

iron-select solves this by adding a hidden native input to the  form it belongs to, and reflecting its `.value` property to the hidden field. The name of the hidden field is determined by iron-input's `.name` property. You know the rest of the story.
Granted, this somewhat breaks the encapsulation and further experiments will show whether it's possible to have the input under iron-select's own light dom. However the benefits of not having to have any further js processing of the element overweigh this (subtle? temporary?) downside.

## Key todos
* Currently expects a raw array of objects from remote data source. Add an optional transform parameter with callback to traverse any server response.
* Support multi = false
* More eventing
* Custom target field (to optionally  replace the autogenerated hidden field desribed [above](#native-form-integration))
* Better docs
* Tests
* Demo
* Proper packaging for customelements.io

## Contribution
Pull requests are most welcome.

## License
[MIT](http://opensource.org/licenses/MIT)

