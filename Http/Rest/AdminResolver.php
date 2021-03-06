<?php
/**
 * Copyright (C) 2014 Ready Business System
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
namespace Rbs\Admin\Http\Rest;

use Change\Http\Rest\Actions\DiscoverNameSpace;
use Change\Http\Rest\Resolver;
use Change\Http\Rest\Request;
use Rbs\Admin\Http\Rest\Actions\BlockList;
use Rbs\Admin\Http\Rest\Actions\CurrentTasks;
use Rbs\Admin\Http\Rest\Actions\GetCurrentUser;
use Rbs\Admin\Http\Rest\Actions\TagsInfo;
use Rbs\Admin\Http\Rest\Actions\DocumentPreview;
use Rbs\Admin\Http\Rest\Actions\DocumentList;
use Rbs\Admin\Http\Rest\Actions\UpdateCurrentUser;

/**
 * @name \Rbs\Admin\Http\Rest\AdminResolver
 */
class AdminResolver
{
	/**
	 * @param \Change\Http\Rest\Resolver $resolver
	 */
	protected $resolver;

	/**
	 * @param \Change\Http\Rest\Resolver $resolver
	 */
	function __construct(Resolver $resolver)
	{
		$this->resolver = $resolver;
	}

	/**
	 * @param \Change\Http\Event $event
	 * @param string[] $namespaceParts
	 * @return string[]
	 */
	public function getNextNamespace($event, $namespaceParts)
	{
		return array('currentUser', 'currentTasks', 'tagsInfo', 'documentPreview', 'documentList', 'blockList');
	}

	/**
	 * Set Event params: resourcesActionName, documentId, LCID
	 * @param \Change\Http\Event $event
	 * @param array $resourceParts
	 * @param $method
	 * @return void
	 */
	public function resolve($event, $resourceParts, $method)
	{
		$nbParts = count($resourceParts);
		if ($nbParts == 0 && $method === Request::METHOD_GET)
		{
			array_unshift($resourceParts, 'admin');
			$event->setParam('namespace', implode('.', $resourceParts));
			$event->setParam('resolver', $this);
			$action = function ($event)
			{
				$action = new DiscoverNameSpace();
				$action->execute($event);
			};
			$event->setAction($action);
			return;
		}
		elseif ($nbParts == 1)
		{
			$actionName = $resourceParts[0];
			if ($actionName === 'currentUser')
			{
				if ($method === Request::METHOD_GET)
				{
					$action = new GetCurrentUser();
					$event->setAction(function($event) use($action) {$action->execute($event);});
					$event->setAuthorization(function() use ($event) {return $event->getAuthenticationManager()->getCurrentUser()->authenticated();});
				}
				elseif ($method === Request::METHOD_PUT)
				{
					$action = new UpdateCurrentUser();
					$event->setAction(function($event) use($action) {$action->execute($event);});
					$event->setAuthorization(function() use ($event) {return $event->getAuthenticationManager()->getCurrentUser()->authenticated();});
				}
			}
			elseif ($actionName === 'currentTasks')
			{
				$event->setAction(function($event) {
					(new CurrentTasks())->execute($event);
				});
				$event->setAuthorization(function() use ($event) {return $event->getAuthenticationManager()->getCurrentUser()->authenticated();});
			}
			elseif ($actionName === 'tagsInfo')
			{
				$event->setAction(function($event) {
					(new TagsInfo())->execute($event);
				});
				$event->setAuthorization(function() use ($event) {return $event->getAuthenticationManager()->getCurrentUser()->authenticated();});
			}
			elseif ($actionName === 'documentPreview')
			{
				$event->setAction(function($event) {
					(new DocumentPreview())->execute($event);
				});
				$event->setAuthorization(function() use ($event) {return $event->getAuthenticationManager()->getCurrentUser()->authenticated();});
			}
			elseif ($actionName === 'documentList')
			{
				$event->setAction(function($event) {
					(new DocumentList())->execute($event);
				});
				$event->setAuthorization(function() use ($event) {return $event->getAuthenticationManager()->getCurrentUser()->authenticated();});
			}

			elseif ($actionName === 'blockList')
			{
				$event->setAction(function($event) {
					(new BlockList())->execute($event);
				});
			}

		}
	}
}