import { defineMock } from 'vite-plugin-mock-dev-server';
import Mock from 'mockjs';

export default defineMock([
	{
		url: '/mock/example/get',
		method: ['GET'],
		delay: 500,
		// 不需要获取请求参数时，可直接写入返回数据
		body: {
			code: 0,
			message: 'OK GET',
			data: Mock.mock({
				'list|10': [
					{
						'id|+1': 1,
					},
				],
			}),
		},
	},
	{
		url: '/mock/example/:id/',
		method: ['GET'],
		delay: 500,
		// 需要获取请求参数时，传入一个函数即可获取
		body: () => {
			return {
				code: 0,
				message: 'OK GET',
				data: Mock.mock({
					'list|10': [
						{
							'id|+1': 1,
						},
					],
				}),
			};
		},
	},
	{
		url: '/mock/example/post',
		method: ['POST'],
		delay: 500,
		// 使用 response 可完全自定义返回数据，调用 next() 可跳过mock
		response(req, res) {
			const { query, body, params } = req;
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.end(
				JSON.stringify({
					code: 201,
					message: 'OK POST',
					data: {
						query,
						body,
						params,
					},
				})
			);
		},
	},
]);
