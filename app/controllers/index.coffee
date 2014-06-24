module.exports = App.IndexController = Ember.ObjectController.extend
	current_line: 'loading..'
	lines: []
	isPlaying: false
	speed: 50
	init: ->
		context = this
		setTimeout(->
			context.play()
		,200)
	play: ->
		@set('isPlaying',true)
		context = this
		@lines = @get('content').split('\n')
		@updateLine()
	pause: ->
		@isPlaying = false
	updateLine: ->
		context = this
		if @isPlaying
			if @get('current_line')=='paused'
				@lines = @get('content').split('\n')
			@set('current_line', @lines.shift())
			@lines.push @current_line
		else
			@set('current_line', 'paused')
		setTimeout(->
			context.updateLine()
		,@speed)
	updateContent: ->
		@set('current_line', 'paused')
