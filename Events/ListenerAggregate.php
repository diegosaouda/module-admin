<?php
namespace Rbs\Admin\Events;


use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;

/**
 * @name \Rbs\Admin\Events\ListenerAggregate
 */
class ListenerAggregate implements ListenerAggregateInterface {

	/**
	 * Attach one or more listeners
	 *
	 * Implementors may add an optional $priority argument; the EventManager
	 * implementation will pass this to the aggregate.
	 *
	 * @param EventManagerInterface $events
	 *
	 * @return void
	 */
	public function attach(EventManagerInterface $events)
	{
		$callback = function (\Zend\EventManager\Event $event)
		{
			(new GetAvailablePageFunctions())->execute($event);
		};
		$events->attach(\Change\Collection\CollectionManager::EVENT_GET_COLLECTION, $callback, 10);
	}

	/**
	 * Detach all previously attached listeners
	 *
	 * @param EventManagerInterface $events
	 *
	 * @return void
	 */
	public function detach(EventManagerInterface $events)
	{
		// TODO: Implement detach() method.
	}
}